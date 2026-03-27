import React, { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Download, Share2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { AppScreen, ScreenContainer } from '../components/layout/AppScreen';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { StyleResultCard } from '../components/StyleResultCard';
import { Button } from '../components/ui/Button';
import { useDownload } from '../hooks/useDownload';
import { useGeneration } from '../hooks/useGeneration';
import { useGoHome } from '../hooks/useGoHome';
import { useHistoryJob } from '../hooks/useHistoryJob';
import { useResponsiveGrid } from '../hooks/useResponsiveGrid';
import { useGenerationStore } from '../store/generationStore';
import type { StyleKey, StyleResult } from '../types';

type GridItem = StyleResult | { style: `placeholder-${number}`; isPlaceholder: true };

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const goHome = useGoHome();
  const { selectedStyles, results, imageUri, error } = useGenerationStore(
    useShallow((state) => ({
      selectedStyles: state.selectedStyles,
      results: state.results,
      imageUri: state.imageUri,
      error: state.error,
    }))
  );
  const { retryFailedStyles } = useGeneration();
  const { downloadAll, shareImage } = useDownload();
  const historyJobId = typeof params.jobId === 'string' ? params.jobId : null;
  const historyJob = useHistoryJob(historyJobId);

  const resolvedSelectedStyles = useMemo(
    () => (historyJobId ? historyJob?.selectedStyles ?? [] : selectedStyles),
    [historyJob, historyJobId, selectedStyles]
  );
  const resolvedResults = useMemo(
    () => (historyJobId ? historyJob?.styles ?? null : results),
    [historyJob, historyJobId, results]
  );
  const resolvedError = historyJobId ? null : error;

  const selectedResults = useMemo(
    () => resolvedSelectedStyles.map((style) => resolvedResults?.[style]).filter(Boolean) as StyleResult[],
    [resolvedResults, resolvedSelectedStyles]
  );

  const completedCount = selectedResults.filter(
    (result) => result.status === 'success' || result.status === 'failure'
  ).length;
  const progressPercent = selectedResults.length === 0 ? 0 : (completedCount / selectedResults.length) * 100;
  const allSettled =
    selectedResults.length > 0 &&
    selectedResults.every((result) => result.status === 'success' || result.status === 'failure');
  const successfulResults = selectedResults.filter(
    (result): result is StyleResult & { outputUrl: string } => result.status === 'success' && !!result.outputUrl
  );
  const { horizontalPaddingClassName, numColumns, paddedItems } =
    useResponsiveGrid<GridItem, GridItem>(
      selectedResults,
      (index) => ({ style: `placeholder-${index}`, isPlaceholder: true })
    );

  const navigateToDetail = (style: StyleKey) => {
    router.push({
      pathname: '/detail',
      params: historyJobId ? { jobId: historyJobId, style } : { style },
    });
  };

  return (
    <AppScreen>
      <View className="flex-1 items-center">
        <ScreenContainer horizontalPaddingClassName={horizontalPaddingClassName}>
          <FlatList
            key={numColumns}
            data={paddedItems}
            numColumns={numColumns}
            keyExtractor={(item) => item.style}
            ListHeaderComponent={
              <View className="mb-6">
                <ScreenHeader
                  title="Your Cliparts"
                  onBack={() => router.back()}
                  onHome={goHome}
                  rightSlot={
                    <View className="min-w-10 items-end justify-center">
                      <Text className="text-right font-medium text-on_surface_variant">
                        {completedCount}/{resolvedSelectedStyles.length}
                      </Text>
                    </View>
                  }
                />

                <View className="relative h-1 w-full rounded-full bg-surface_container">
                  <View
                    style={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full bg-tertiary"
                  />
                </View>

                <Text className="mt-3 text-sm text-on_surface_variant">
                  {historyJobId
                    ? historyJob
                      ? 'Saved results from your history.'
                      : 'Loading saved job...'
                    : imageUri
                      ? allSettled
                        ? 'All selected styles have finished.'
                        : 'Your results are updating live while the backend finishes processing.'
                      : 'Select an image to start generating.'}
                </Text>

                {resolvedError ? (
                  <View className="mt-4 rounded-2xl border border-error/60 bg-error/10 px-4 py-3">
                    <Text className="text-sm text-error">{resolvedError}</Text>
                  </View>
                ) : null}

                {allSettled && successfulResults.length > 0 ? (
                  <View className="mt-5 flex-row gap-3">
                    <Button
                      className="flex-1 rounded-2xl bg-tertiary"
                      leftIcon={<Download size={18} color="#ffffff" />}
                      onPress={() => {
                        void downloadAll(successfulResults);
                      }}
                    >
                      Download All
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-2xl"
                      leftIcon={<Share2 size={18} color="#e5e2e1" />}
                      onPress={() => {
                        void shareImage(successfulResults[0].outputUrl);
                      }}
                    >
                      Share
                    </Button>
                  </View>
                ) : null}
              </View>
            }
            renderItem={({ item }) => {
              if ('isPlaceholder' in item && item.isPlaceholder) {
                return <View className="m-1.5 flex-1" />;
              }

              const resultItem = item as StyleResult;

              return (
                <StyleResultCard
                  result={resultItem}
                  onPress={(style) => {
                    navigateToDetail(style);
                  }}
                  onRetry={
                    historyJobId
                      ? undefined
                      : (style) => {
                          void retryFailedStyles([style]);
                        }
                  }
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </ScreenContainer>
        <View className="mb-8" />
      </View>
    </AppScreen>
  );
}
