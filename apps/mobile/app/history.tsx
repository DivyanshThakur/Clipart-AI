import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Trash2 } from 'lucide-react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Button } from '../components/ui/Button';
import { getStyleLabel } from '../constants/styles';
import { useGoHome } from '../hooks/useGoHome';
import { clearHistory, getHistory } from '../services/history';
import type { HistoryJob, StyleKey } from '../types';

function getAvailableStyles(job: HistoryJob): StyleKey[] {
  return job.selectedStyles.filter((style) => job.styles[style]?.status === 'success' && !!job.styles[style]?.outputUrl);
}

export default function HistoryScreen() {
  const router = useRouter();
  const goHome = useGoHome();
  const [history, setHistory] = useState<HistoryJob[]>([]);

  const loadHistory = useCallback(() => {
    void getHistory().then(setHistory);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleClear = () => {
    void clearHistory().then(loadHistory);
  };

  return (
    <AppScreen>
      <View className="flex-1 px-6">
        <ScreenHeader
          title="History"
          onBack={() => router.back()}
          onHome={goHome}
          rightSlot={
            <Pressable
              onPress={handleClear}
              disabled={history.length === 0}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface_container_low active:opacity-70"
            >
              <Trash2
                size={18}
                color={history.length === 0 ? '#7b7877' : '#f2b8b5'}
              />
            </Pressable>
          }
        />

        <FlatList
          data={history}
          keyExtractor={(item) => item.jobId}
          contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
          ListEmptyComponent={
            <View className="mt-24 items-center rounded-[28px] border border-outline/30 bg-surface_container_low px-6 py-10">
              <Text className="text-center text-lg font-semibold text-on_surface">No saved jobs yet.</Text>
              <Text className="mt-2 text-center text-sm text-on_surface_variant">
                Finished generations will appear here automatically.
              </Text>
              <Button className="mt-6" onPress={goHome}>
                Create new clipart
              </Button>
            </View>
          }
          renderItem={({ item }) => {
            const availableStyles = getAvailableStyles(item);

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/results',
                    params: { jobId: item.jobId },
                  })
                }
                className="overflow-hidden rounded-[28px] border border-outline/25 bg-surface_container_low active:opacity-90"
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: '100%', height: 180 }}
                  contentFit="cover"
                />
                <View className="px-5 py-5">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-lg text-on_surface">
                      {new Date(item.completedAt).toLocaleString()}
                    </Text>
                    <Text className="text-sm text-on_surface_variant">
                      {availableStyles.length}/{item.selectedStyles.length} styles
                    </Text>
                  </View>

                  <View className="mt-4 flex-row flex-wrap gap-2">
                    {availableStyles.map((style) => (
                      <View
                        key={style}
                        className="rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-2"
                      >
                        <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                          {getStyleLabel(style)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </AppScreen>
  );
}
