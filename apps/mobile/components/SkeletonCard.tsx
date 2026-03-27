import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function SkeletonCard() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-280, 280]),
      },
    ],
  }));

  return (
    <View className="h-full w-full overflow-hidden rounded-[24px] bg-surface_container_high">
      <View className="absolute inset-x-0 bottom-0 p-4">
        <View className="h-6 w-28 rounded-xl bg-white/10" />
      </View>
      <AnimatedGradient
        colors={['transparent', 'rgba(255,255,255,0.16)', 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[StyleSheet.absoluteFillObject, { width: '55%' }, animatedStyle]}
      />
    </View>
  );
}
