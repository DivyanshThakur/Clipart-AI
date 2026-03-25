import React from 'react';
import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';

interface ImagePreviewProps {
  uri: string;
  onRemove: () => void;
}

export function ImagePreview({ uri, onRemove }: ImagePreviewProps) {
  return (
    <View className="relative w-full overflow-hidden rounded-[32px] bg-surface_container_low">
      <Image
        source={{ uri }}
        contentFit="cover"
        style={{ width: '100%', height: 350 }}
      />
      
      <Pressable
        onPress={onRemove}
        className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-black/50 active:opacity-70"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <X size={20} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
