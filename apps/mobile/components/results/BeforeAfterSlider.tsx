import React from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChevronsLeftRight } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  runOnJS 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BeforeAfterSliderProps {
  original: string;
  generated: string;
}

/**
 * Custom Before/After Image Slider using React Native Reanimated & Gesture Handler.
 * This provides buttery smooth performance and avoids common clipping bugs in older libraries.
 */
export function BeforeAfterSlider({ original, generated }: BeforeAfterSliderProps) {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = Math.min(windowWidth - 48, 500);
  const containerHeight = containerWidth * 1.2;

  // Slider position (0 to containerWidth)
  const position = useSharedValue(containerWidth / 2);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      // Constrain position within container
      const nextPos = Math.min(Math.max(0, event.x), containerWidth);
      position.value = nextPos;
    })
    .onStart(() => {
      runOnJS(triggerHaptic)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    width: position.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value - 32 }], // 32 is half of draggerWidth
  }));

  return (
    <View 
      style={{ width: containerWidth, height: containerHeight }} 
      className="overflow-hidden rounded-[32px] border border-outline/20 bg-surface_container_lowest"
    >
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill}>
          {/* Base Layer: Generated (After) */}
          <View style={StyleSheet.absoluteFill}>
            <Image
              source={{ uri: generated }}
              style={{ width: containerWidth, height: containerHeight }}
              contentFit="cover"
              transition={0}
            />
          </View>

          {/* Top Layer: Original (Before) - Clipped by width */}
          <Animated.View style={[StyleSheet.absoluteFill, animatedStyle, { overflow: 'hidden' }]}>
            <Image
              source={{ uri: original }}
              style={{ width: containerWidth, height: containerHeight }}
              contentFit="cover"
              transition={0}
            />
          </Animated.View>

          {/* Dragger Handle */}
          <Animated.View 
            style={[
              { position: 'absolute', height: '100%', width: 64, zIndex: 10 },
              handleStyle
            ]}
          >
            <View className="flex-1 items-center justify-center">
              {/* Vertical Split Line */}
              <View className="h-full w-[2px] bg-white/80" />
              
              {/* Grab Circle */}
              <View 
                className="absolute h-10 w-10 items-center justify-center rounded-full bg-white"
                style={{ top: '50%', marginTop: -20 }}
              >
                <ChevronsLeftRight size={20} color="#131313" strokeWidth={2.5} />
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
      
      {/* Absolute labels positioned over the comparison area */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View className="absolute bottom-6 left-6 rounded-full bg-black/60 px-4 py-2">
          <Text className="text-[12px] font-bold text-white uppercase tracking-wider">Original</Text>
        </View>
        <View className="absolute bottom-6 right-6 rounded-full bg-tertiary px-4 py-2">
          <Text className="text-[12px] font-bold text-white uppercase tracking-wider">Generated</Text>
        </View>
      </View>
    </View>
  );
}
