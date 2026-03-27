import React, { useEffect } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Camera, Images, X } from 'lucide-react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type ImageSourceSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (source: 'camera' | 'gallery') => void;
};

const SHEET_HEIGHT = 320;

export function ImageSourceSheet({ visible, onClose, onSelect }: ImageSourceSheetProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 260 : 180,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [SHEET_HEIGHT, 0]),
      },
    ],
  }));

  const handleSelect = (source: 'camera' | 'gallery') => {
    onSelect(source);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View className="absolute inset-0 bg-black/55" style={backdropStyle}>
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={sheetStyle}
          className="rounded-t-[32px] border-t border-outline/30 bg-surface_container_low px-6 pb-10 pt-5"
        >
          <View className="mb-5 items-center">
            <View className="h-1.5 w-14 rounded-full bg-outline/50" />
          </View>

          <View className="mb-6 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[24px] font-bold leading-7 text-on_surface">Choose image source</Text>
              <Text className="mt-2 text-sm leading-5 text-on_surface_variant">
                Snap a new photo or pull one straight from your gallery.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface_container active:opacity-70"
            >
              <X size={18} color="#e5e2e1" />
            </Pressable>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={() => handleSelect('camera')}
              className="rounded-[24px] border border-outline/25 bg-surface_container px-5 py-5 active:opacity-90"
            >
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-tertiary/15">
                  <Camera size={22} color="#d2bbff" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-on_surface">Take photo</Text>
                  <Text className="mt-1 text-sm text-on_surface_variant">
                    Open the camera and capture a new portrait.
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              onPress={() => handleSelect('gallery')}
              className="rounded-[24px] border border-outline/25 bg-surface_container px-5 py-5 active:opacity-90"
            >
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
                  <Images size={22} color="#8ec5ff" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-on_surface">Choose from gallery</Text>
                  <Text className="mt-1 text-sm text-on_surface_variant">
                    Pick an existing JPG or PNG from your library.
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
