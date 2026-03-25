import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Loader2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { interopIcon } from '../lib/icons';

import { ResultCard } from '../components/results/ResultCard';
import { Button } from '../components/ui/Button';

interopIcon(Loader2);

// Mock data using high-quality unsplash images for demo
const STYLES_DATA = [
  { id: 'cartoons', name: 'Cartoon', image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800' },
  { id: 'anime', name: 'Anime', image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=800' },
  { id: 'pixel_art', name: 'Pixel Art', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800' },
  { id: 'flat_illustration', name: 'Flat Illustration', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
  { id: 'sketch', name: 'Sketch', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800' },
  { id: 'comic_book', name: 'Comic Book', image: 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=800' },
];

export default function ResultsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [results, setResults] = useState<any[]>(
    STYLES_DATA.map(s => ({ ...s, status: 'generating' as const }))
  );

  // Simulation of generation process
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= results.length) {
        clearInterval(interval);
        return;
      }

      setResults(prev => {
        const next = [...prev];
        // Simulate a mix of success and rare occasional error for demo
        const isError = index > 3 && Math.random() > 0.85;
        next[index].status = isError ? 'error' : 'success';

        return next;
      });
      index++;
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const completedResults = results.filter(r => r.status !== 'generating');
  const completedCount = completedResults.length;
  const isGenerating = completedCount < results.length;
  const progressPercent = (completedCount / results.length) * 100;


  const navigateToDetail = (item: any) => {
    router.push({
      pathname: '/detail',
      params: { id: item.id, name: item.name, image: item.image }
    });
  };

  const handleRetry = (id: string) => {
    setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'generating' } : r));
    // In a real app, this would trigger re-fetch
    setTimeout(() => {
      setResults(prev => prev.map(r => r.id === id ? { ...r, status: 'success' } : r));
    }, 2000);
  };

  // Responsive Grid Logic
  const numColumns = width < 450 ? 2 : width < 900 ? 3 : 4;
  const horizontalPadding = width < 500 ? 'px-4' : 'px-8';

  // Pad data with placeholders for grid alignment
  const paddedResults: any[] = [...results];
  const numToPad = (numColumns - (results.length % numColumns)) % numColumns;
  for (let i = 0; i < numToPad; i++) {
    paddedResults.push({ id: `placeholder-${i}`, isPlaceholder: true });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center">
        <View
          className={`w-full ${horizontalPadding}`}
          style={{ maxWidth: 1200 }}
        >
          {/* Results Grid */}
          <FlatList
            key={numColumns}
            data={paddedResults}
            numColumns={numColumns}
            keyExtractor={item => item.id}
            ListHeaderComponent={(
              <View className="mb-6">
                {/* Header */}
                <View className="mb-2 h-14 flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-surface_container_low active:opacity-70"
                  >
                    <ChevronLeft size={20} color="#e5e2e1" />
                  </TouchableOpacity>
                  <Text className="font-bold text-[20px] text-on_surface">Your Cliparts</Text>
                  <Text className="w-10 text-right font-medium text-on_surface_variant">
                    {completedCount}/{results.length}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="relative h-1 w-full rounded-full bg-surface_container">
                  <View
                    style={{ width: `${progressPercent}%` }}
                    className="h-full rounded-full bg-tertiary"
                  />
                </View>
              </View>
            )}
            renderItem={({ item }: { item: any }) => {
              if (item.isPlaceholder) {
                return <View className="flex-1 m-1.5" />;
              }
              return (
                <ResultCard
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  status={item.status}
                  onPress={(id) => {
                    if (item.status === 'success') {
                      navigateToDetail(item);
                    }
                  }}
                  onRetry={handleRetry}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>
        {/* Minimal padding at bottom */}
        <View className="mb-8" />
      </View>
    </SafeAreaView>
  );
}
