import { useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { STYLE_KEYS } from '../constants/styles';
import { showToast } from '../components/ui/toast';
import { getFriendlyGenerationErrorMessage, getFriendlyStyleErrorMessage } from '../lib/generationErrors';
import { ApiRequestError, pollJobStatus, startGeneration, uploadImage } from '../services/api';
import { persistJob } from '../services/history';
import { useGenerationStore } from '../store/generationStore';
import type { GenerationPhase, StyleKey, StyleResult } from '../types';

const POLL_INTERVAL_MS = 1_000;
const MAX_POLL_ATTEMPTS = 60;
const MAX_POLL_DURATION_MS = 60_000;
const POLL_TIMEOUT_MESSAGE = 'Generation is taking longer than expected. Please try again.';
const GENERATION_ALREADY_STARTED_CODE = 'GENERATION_ALREADY_STARTED';

let pollTimeout: ReturnType<typeof setTimeout> | null = null;
let activeSubscribers = 0;
let activePollToken = 0;
const lastPollSnapshots = new Map<string, string>();

function stopPolling() {
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
}


function getStoreState() {
  return useGenerationStore.getState();
}

function areStylesSettled(results: Record<StyleKey, StyleResult>, styles: StyleKey[]): boolean {
  return styles.every((style) => {
    const status = results[style].status;
    return status === 'success' || status === 'failure';
  });
}

async function persistCompletedJob(jobId: string) {
  const state = getStoreState();

  if (!state.imageUri) {
    return;
  }

  await persistJob({
    jobId,
    sourceImageUri: state.imageUri,
    uploadedImageUrl: state.imageUrl,
    styles: state.results,
    selectedStyles: state.selectedStyles,
    completedAt: new Date().toISOString(),
  });
}

async function syncJobStatus(jobId: string, selectedStyles: StyleKey[], pollToken: number) {
  const response = await pollJobStatus(jobId);

  if (pollToken !== activePollToken) {
    return;
  }

  const store = getStoreState();

  selectedStyles.forEach((style) => {
    const nextStyle = response.styles[style];

    if (!nextStyle) {
      return;
    }

    store.updateStyleResult(style, {
      status: nextStyle.status,
      outputUrl: nextStyle.outputUrl,
      error: nextStyle.status === 'failure' ? getFriendlyStyleErrorMessage(nextStyle.error) : nextStyle.error,
    });
  });

  const snapshot = JSON.stringify(
    selectedStyles.map((style) => ({
      error: response.styles[style]?.error ?? null,
      outputUrl: response.styles[style]?.outputUrl ?? null,
      status: response.styles[style]?.status ?? 'missing',
      style,
    }))
  );

  if (lastPollSnapshots.get(jobId) !== snapshot) {
    lastPollSnapshots.set(jobId, snapshot);
  }

  const nextState = getStoreState();
  nextState.setImageUrl(response.imageUrl);

  if (areStylesSettled(nextState.results, selectedStyles)) {
    stopPolling();
    lastPollSnapshots.delete(jobId);
    nextState.setPhase('completed');
    nextState.setError(null);
    await persistCompletedJob(jobId);
  }
}

function beginPolling(jobId: string, selectedStyles: StyleKey[]) {
  stopPolling();
  activePollToken += 1;
  const pollToken = activePollToken;
  lastPollSnapshots.delete(jobId);
  const startedAt = Date.now();
  let attempts = 0;
  let isRequestInFlight = false;


  const failPolling = () => {
    if (pollToken !== activePollToken) {
      return;
    }

    const store = getStoreState();
    stopPolling();
    lastPollSnapshots.delete(jobId);
    store.setPhase('error');
    store.setError(POLL_TIMEOUT_MESSAGE);
    showToast({
      title: 'Generation delayed',
      message: POLL_TIMEOUT_MESSAGE,
    });
  };

  const scheduleNextRun = () => {
    if (pollToken !== activePollToken) {
      return;
    }

    pollTimeout = setTimeout(() => {
      void run();
    }, POLL_INTERVAL_MS);
  };

  const run = async () => {
    if (pollToken !== activePollToken || isRequestInFlight) {
      return;
    }

    if (attempts >= MAX_POLL_ATTEMPTS || Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
      failPolling();
      return;
    }

    attempts += 1;
    isRequestInFlight = true;

    try {
      await syncJobStatus(jobId, selectedStyles, pollToken);

      if (pollToken !== activePollToken) {
        return;
      }

      const nextState = getStoreState();
      if (nextState.phase === 'completed') {
        return;
      }

      if (areStylesSettled(nextState.results, selectedStyles)) {
        return;
      }

      if (attempts >= MAX_POLL_ATTEMPTS || Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
        failPolling();
        return;
      }

      scheduleNextRun();
    } catch (error) {
      const message = getFriendlyGenerationErrorMessage(
        error,
        'We could not refresh your results. Please try again.'
      );
      const store = getStoreState();
      stopPolling();
      lastPollSnapshots.delete(jobId);
      store.setPhase('error');
      store.setError(message);
      showToast({
        title: 'Status update failed',
        message,
      });
    } finally {
      isRequestInFlight = false;
    }
  };

  void run();
}

export function useGeneration() {
  const {
    jobId,
    phase,
    error,
    selectedStyles,
    setAllStylesStatus,
    setError,
    setImageUrl,
    setJobId,
    setPhase,
    setSelectedStyles,
    updateStyleResult,
  } = useGenerationStore(
    useShallow((state) => ({
      jobId: state.jobId,
      phase: state.phase,
      error: state.error,
      selectedStyles: state.selectedStyles,
      setAllStylesStatus: state.setAllStylesStatus,
      setError: state.setError,
      setImageUrl: state.setImageUrl,
      setJobId: state.setJobId,
      setPhase: state.setPhase,
      setSelectedStyles: state.setSelectedStyles,
      updateStyleResult: state.updateStyleResult,
    }))
  );

  useEffect(() => {
    activeSubscribers += 1;

    return () => {
      activeSubscribers -= 1;
      if (activeSubscribers <= 0) {
        stopPolling();
      }
    };
  }, []);

  const generate = useCallback(
    async (imageUri: string, styles: StyleKey[]) => {
      let uploadedJobId: string | null = null;

      setSelectedStyles(styles);
      setJobId(null);
      setImageUrl(null);
      setError(null);
      setPhase('uploading');
      setAllStylesStatus(styles, 'uploading');

      STYLE_KEYS.filter((style) => !styles.includes(style)).forEach((style) => {
        updateStyleResult(style, {
          status: 'uploading',
          outputUrl: null,
          error: null,
        });
      });

      router.push('/results');

      try {
        const uploadResponse = await uploadImage(imageUri);
        uploadedJobId = uploadResponse.jobId;
        setJobId(uploadResponse.jobId);
        setImageUrl(uploadResponse.imageUrl);
        setPhase('processing');
        setAllStylesStatus(styles, 'processing');

        await startGeneration(uploadResponse.jobId, styles);
        beginPolling(uploadResponse.jobId, styles);
      } catch (generationError) {
        if (
          generationError instanceof ApiRequestError &&
          generationError.code === GENERATION_ALREADY_STARTED_CODE &&
          uploadedJobId
        ) {
          setPhase('processing');
          beginPolling(uploadedJobId, styles);
          return;
        }

        const message = getFriendlyGenerationErrorMessage(generationError);
        setPhase('error');
        setError(message);
        setAllStylesStatus(styles, 'failure', message);
        showToast({
          title: 'Generation failed',
          message,
        });
      }
    },
    [setAllStylesStatus, setError, setImageUrl, setJobId, setPhase, setSelectedStyles, updateStyleResult]
  );

  const retryFailedStyles = useCallback(
    async (styles: StyleKey[]) => {
      if (!jobId) {
        showToast({
          title: 'Retry unavailable',
          message: 'This generation is missing a valid job reference. Please start a new one.',
        });
        return;
      }

      setError(null);
      setPhase('processing');

      styles.forEach((style) => {
        updateStyleResult(style, {
          status: 'processing',
          outputUrl: null,
          error: null,
        });
      });

      try {
        await startGeneration(jobId, styles);
        beginPolling(jobId, selectedStyles);
      } catch (retryError) {
        if (retryError instanceof ApiRequestError && retryError.code === GENERATION_ALREADY_STARTED_CODE) {
          setPhase('processing');
          beginPolling(jobId, selectedStyles);
          return;
        }

        const message = getFriendlyGenerationErrorMessage(
          retryError,
          'We could not retry this style. Please try again.'
        );
        styles.forEach((style) => {
          updateStyleResult(style, {
            status: 'failure',
            error: message,
          });
        });
        setPhase('error');
        setError(message);
        showToast({
          title: 'Retry failed',
          message,
        });
      }
    },
    [jobId, selectedStyles, setError, setPhase, updateStyleResult]
  );

  return {
    generate,
    retryFailedStyles,
    jobId,
    status: phase as GenerationPhase,
    loading: phase === 'uploading' || phase === 'processing',
    error,
  };
}
