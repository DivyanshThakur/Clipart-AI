import * as FileSystem from 'expo-file-system/legacy';
import { MMKV } from 'react-native-mmkv';
import type { HistoryJob, StyleKey, StyleResult } from '../types';

const HISTORY_KEY = 'clipart-history';
const HISTORY_FILES_DIR = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}history` : null;

let mmkvStorage: MMKV | null = null;
let memoryHistoryValue: string | undefined;

try {
  mmkvStorage = new MMKV({
    id: 'clipart-ai-storage',
  });
} catch (error) {
  if (__DEV__) {
    console.warn('MMKV native module is unavailable. Falling back to in-memory history storage.', error);
  }
}

async function readHistoryValue(): Promise<string | undefined> {
  if (mmkvStorage) {
    return mmkvStorage.getString(HISTORY_KEY);
  }

  return memoryHistoryValue;
}

async function writeHistoryValue(value: string): Promise<void> {
  if (mmkvStorage) {
    mmkvStorage.set(HISTORY_KEY, value);
    return;
  }

  memoryHistoryValue = value;
}

async function deleteHistoryValue(): Promise<void> {
  if (mmkvStorage) {
    mmkvStorage.delete(HISTORY_KEY);
    return;
  }

  memoryHistoryValue = undefined;
}

function sortJobs(jobs: HistoryJob[]): HistoryJob[] {
  return [...jobs].sort(
    (left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
  );
}

function getJobDirectory(jobId: string): string {
  if (!HISTORY_FILES_DIR) {
    throw new Error('File storage is unavailable on this device.');
  }

  return `${HISTORY_FILES_DIR}/${jobId}`;
}

async function ensureDirectoryExists(directory: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(directory);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }
}

async function replaceDirectory(directory: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(directory);

  if (info.exists) {
    await FileSystem.deleteAsync(directory, { idempotent: true });
  }

  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
}

function getFileExtension(uri: string, fallback: string): string {
  const cleanUri = uri.split('?')[0] ?? uri;
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? fallback;
}

async function persistSourceImage(sourceUri: string, targetDirectory: string): Promise<string> {
  const extension = getFileExtension(sourceUri, 'jpg');
  const targetUri = `${targetDirectory}/source.${extension}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: targetUri,
  });

  return targetUri;
}

async function persistGeneratedStyles(
  styles: Record<StyleKey, StyleResult>,
  targetDirectory: string
): Promise<Record<StyleKey, StyleResult>> {
  const entries = await Promise.all(
    Object.entries(styles).map(async ([style, result]) => {
      if (result.status !== 'success' || !result.outputUrl) {
        return [style, result] as const;
      }

      const targetUri = `${targetDirectory}/${style}.png`;

      try {
        const downloaded = await FileSystem.downloadAsync(result.outputUrl, targetUri);
        return [
          style,
          {
            ...result,
            outputUrl: downloaded.uri,
          },
        ] as const;
      } catch {
        return [style, result] as const;
      }
    })
  );

  return Object.fromEntries(entries) as Record<StyleKey, StyleResult>;
}

function normalizeHistoryJob(job: HistoryJob): HistoryJob {
  const selectedStyles =
    job.selectedStyles && job.selectedStyles.length > 0
      ? job.selectedStyles
      : (Object.values(job.styles)
          .filter((style) => style.status !== 'uploading')
          .map((style) => style.style) as StyleKey[]);

  return {
    ...job,
    uploadedImageUrl: job.uploadedImageUrl ?? null,
    selectedStyles,
  };
}

export async function saveJob(job: HistoryJob): Promise<void> {
  const existingJobs = (await getHistory()).filter((entry) => entry.jobId !== job.jobId);
  await writeHistoryValue(JSON.stringify(sortJobs([normalizeHistoryJob(job), ...existingJobs])));
}

export async function persistJob(job: {
  jobId: string;
  sourceImageUri: string;
  uploadedImageUrl: string | null;
  styles: Record<StyleKey, StyleResult>;
  selectedStyles: StyleKey[];
  completedAt: string;
}): Promise<void> {
  if (!HISTORY_FILES_DIR) {
    throw new Error('File storage is unavailable on this device.');
  }

  await ensureDirectoryExists(HISTORY_FILES_DIR);

  const jobDirectory = getJobDirectory(job.jobId);
  await replaceDirectory(jobDirectory);

  const [sourceImageUri, persistedStyles] = await Promise.all([
    persistSourceImage(job.sourceImageUri, jobDirectory),
    persistGeneratedStyles(job.styles, jobDirectory),
  ]);

  await saveJob({
    jobId: job.jobId,
    imageUrl: sourceImageUri,
    uploadedImageUrl: job.uploadedImageUrl,
    styles: persistedStyles,
    selectedStyles: job.selectedStyles,
    completedAt: job.completedAt,
  });
}

export async function getHistory(): Promise<HistoryJob[]> {
  const rawValue = await readHistoryValue();

  if (!rawValue) {
    return [];
  }

  try {
    return sortJobs((JSON.parse(rawValue) as HistoryJob[]).map(normalizeHistoryJob));
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  await deleteHistoryValue();

  if (HISTORY_FILES_DIR) {
    await FileSystem.deleteAsync(HISTORY_FILES_DIR, { idempotent: true });
  }
}
