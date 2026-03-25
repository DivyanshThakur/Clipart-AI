import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Download, Share2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BeforeAfterSlider } from '../components/results/BeforeAfterSlider';
import { Button } from '../components/ui/Button';

export default function ImageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = params.name as string || 'Anime';

  // Mock images for demonstration of the transition effect
  const original = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1024';
  const generated = 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=1024';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="relative h-14 flex-row items-center px-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="z-10 h-10 w-10 items-center justify-center rounded-full bg-surface_container_low active:opacity-60"
          >
            <ChevronLeft size={20} color="#e5e2e1" />
          </TouchableOpacity>
          <View className="absolute inset-x-0 items-center justify-center pointer-events-none">
            <Text className="font-bold text-[18px] text-on_surface">{name}</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Comparison Slider */}
          <BeforeAfterSlider original={original} generated={generated} />

          {/* Details Text */}
          <View className="mt-8 w-full max-w-[500px] items-start">
            <Text className="font-bold text-[28px] leading-9 text-on_surface">{name}</Text>
            <Text className="mt-1 text-[14px] font-medium text-on_surface_variant">Generated with Clipart AI</Text>
          </View>

          {/* Action Buttons */}
          <View className="mt-10 w-full max-w-[500px] gap-4">
            <Button
              className="w-full py-5 rounded-3xl bg-tertiary border-0"
              leftIcon={<Download size={20} color="#FFFFFF" />}
            >
              Download PNG
            </Button>
            <Button
              variant="outline"
              className="w-full py-5 rounded-3xl border border-outline"
              leftIcon={<Share2 size={20} color="#e5e2e1" />}
            >
              Share
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
