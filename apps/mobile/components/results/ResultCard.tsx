import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Check, AlertCircle } from 'lucide-react-native';

interface ResultCardProps {
  id: string;
  name: string;
  image?: string;
  status: 'generating' | 'success' | 'error';
  selected: boolean;
  onSelect: (id: string) => void;
  onRetry: (id: string) => void;
}

export function ResultCard({ id, name, image, status, selected, onSelect, onRetry }: ResultCardProps) {
  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isGenerating = status === 'generating';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => isSuccess ? onSelect(id) : isError ? onRetry(id) : null}
      className={`relative aspect-square flex-1 m-1.5 overflow-hidden rounded-[24px] border-2 ${
        isError ? 'border-error/50 bg-error/5' : 
        selected ? 'border-tertiary bg-surface_container' : 'border-transparent bg-surface_container'
      }`}
    >
      {isSuccess && image ? (
        <Image
          source={{ uri: image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
        />
      ) : isGenerating ? (
        <View className="h-full w-full items-center justify-center bg-surface_container_high">
          {/* Subtle placeholder/loading state */}
          <View className="absolute inset-x-0 bottom-0 p-3 opacity-30">
            <View className="h-6 w-20 rounded-lg bg-on_surface_variant/20" />
          </View>
        </View>
      ) : isError ? (
        <View className="h-full w-full items-center justify-center p-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-error/10">
            <AlertCircle size={24} color="#f2b8b5" strokeWidth={2} />
          </View>
          <Text className="mt-2 text-center text-[13px] font-bold text-error">Generation failed</Text>
          <Text className="text-center text-[11px] text-error/60">Tap to retry</Text>
        </View>
      ) : (
        <View className="h-full w-full bg-surface_container_high" />
      )}

      {/* Label Overlay (always show name except in error state) */}
      {!isError && (
        <View className="absolute inset-x-0 bottom-0 p-3">
          <View className="self-start rounded-xl bg-black/60 px-3 py-1.5">
            <Text className="text-[11px] font-black uppercase tracking-widest text-white">
              {name}
            </Text>
          </View>
        </View>
      )}

      {/* Selection Indicator */}
      {isSuccess && selected && (
        <View className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full bg-tertiary">
          <Check size={16} color="#FFFFFF" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}
