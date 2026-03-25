import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image as ImageIcon, CircleAlert } from 'lucide-react-native';

interface UploadDropzoneProps {
  onPress?: () => void;
  error?: string;
}

export function UploadDropzone({ onPress, error }: UploadDropzoneProps) {
  const isError = !!error;

  return (
    <View className="w-full relative">
      <Pressable
        onPress={onPress}
        className={`relative h-72 w-full items-center justify-center rounded-[24px] border-2 border-dashed bg-surface_container_lowest active:opacity-90 ${
          isError ? 'border-error' : 'border-outline_variant'
        }`}
      >
        <View className="absolute inset-0 rounded-[24px] bg-surface_container_lowest opacity-95" />
        {!isError && (
          <>
            <View className="absolute left-0 top-0 h-8 w-8 rounded-tl-[24px] border-l-2 border-t-2 border-primary" />
            <View className="absolute bottom-0 right-0 h-8 w-8 rounded-br-[24px] border-b-2 border-r-2 border-primary" />
          </>
        )}

        <View
          className={`mb-6 h-20 w-20 items-center justify-center rounded-full ${
            isError ? 'bg-error_container' : 'bg-surface_container'
          }`}
        >
          {isError ? (
            <CircleAlert size={32} color="#ef4444" strokeWidth={2.2} />
          ) : (
            <ImageIcon size={24} color="#D2BBFF" strokeWidth={1.8} />
          )}
        </View>

        <Text
          className={`mb-1 text-center font-medium text-[20px] leading-7 ${
            isError ? 'text-error' : 'text-on_surface'
          }`}
        >
          {isError ? error : 'Tap to upload'}
        </Text>
        <Text
          className={`text-center text-xs font-medium uppercase tracking-[1.2px] ${
            isError ? 'text-secondary opacity-60' : 'text-secondary'
          }`}
        >
          {isError ? 'PLEASE USE PNG OR JPG' : 'Or use camera'}
        </Text>
      </Pressable>
    </View>
  );
}
