import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Download, Share2 } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { BeforeAfterSlider } from '../components/results/BeforeAfterSlider';
import { Button } from '../components/ui/Button';
import { getStyleLabel, STYLE_KEYS } from '../constants/styles';
import { useDownload } from '../hooks/useDownload';
import { useGoHome } from '../hooks/useGoHome';
import { useHistoryJob } from '../hooks/useHistoryJob';
import { useGenerationStore } from '../store/generationStore';
import type { StyleKey, StyleResult } from '../types';

function isStyleKey(value: string): value is StyleKey {
  return STYLE_KEYS.includes(value as StyleKey);
}

export default function ImageDetailScreen() {
  const router = useRouter();
  const goHome = useGoHome();
  const params = useLocalSearchParams();
  const { downloadImage, shareImage } = useDownload();
  const { currentJobId, currentImageUri, currentImageUrl, currentResults } = useGenerationStore(
    useShallow((state) => ({
      currentJobId: state.jobId,
      currentImageUri: state.imageUri,
      currentImageUrl: state.imageUrl,
      currentResults: state.results,
    }))
  );

  const styleParam = typeof params.style === 'string' ? params.style : '';
  const jobIdParam = typeof params.jobId === 'string' ? params.jobId : null;
  const style = isStyleKey(styleParam) ? styleParam : null;
  const resolvedJobId = jobIdParam ?? currentJobId;
  const fallbackJob = useHistoryJob(jobIdParam);

  const result: StyleResult | null = useMemo(() => {
    if (!style) {
      return null;
    }

    if (resolvedJobId && resolvedJobId === currentJobId) {
      return currentResults[style];
    }

    return fallbackJob?.styles[style] ?? null;
  }, [currentJobId, currentResults, fallbackJob, resolvedJobId, style]);

  const originalImage = useMemo(() => {
    if (resolvedJobId && resolvedJobId === currentJobId) {
      return currentImageUri ?? currentImageUrl;
    }

    return fallbackJob?.imageUrl ?? fallbackJob?.uploadedImageUrl ?? currentImageUrl;
  }, [currentImageUri, currentImageUrl, currentJobId, fallbackJob, resolvedJobId]);

  if (!style || !result?.outputUrl || !originalImage) {
    return (
      <AppScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-semibold text-on_surface">This result is not available.</Text>
          <Button className="mt-6" onPress={goHome}>
            Go Home
          </Button>
        </View>
      </AppScreen>
    );
  }

  const name = getStyleLabel(style);

  return (
    <AppScreen>
      <View className="flex-1">
        <View className="px-6">
          <ScreenHeader title={name} onBack={() => router.back()} onHome={goHome} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            alignItems: 'center',
            paddingVertical: 24,
            paddingHorizontal: 24,
            paddingBottom: 60,
          }}
          showsVerticalScrollIndicator={false}
        >
          <BeforeAfterSlider original={originalImage} generated={result.outputUrl} />

          <View className="mt-8 w-full max-w-[500px] items-start">
            <Text className="font-bold text-[28px] leading-9 text-on_surface">{name}</Text>
            <Text className="mt-1 text-[14px] font-medium text-on_surface_variant">
              Generated with Clipart AI
            </Text>
          </View>

          <View className="mt-10 w-full max-w-[500px] gap-4">
            <Button
              className="w-full rounded-3xl border-0 bg-tertiary py-5"
              leftIcon={<Download size={20} color="#FFFFFF" />}
              onPress={() => {
                void downloadImage(result.outputUrl as string, name);
              }}
            >
              Download PNG
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-3xl border border-outline py-5"
              leftIcon={<Share2 size={20} color="#e5e2e1" />}
              onPress={() => {
                void shareImage(result.outputUrl as string);
              }}
            >
              Share
            </Button>
          </View>
        </ScrollView>
      </View>
    </AppScreen>
  );
}
