import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { CircleAlert, CircleCheckBig } from 'lucide-react-native';
import { getStyleLabel } from '../constants/styles';
import type { StyleResult } from '../types';
import { SkeletonCard } from './SkeletonCard';

type StyleResultCardProps = {
  result: StyleResult;
  onPress: (style: StyleResult['style']) => void;
  onRetry?: (style: StyleResult['style']) => void;
};

export function StyleResultCard({ result, onRetry, onPress }: StyleResultCardProps) {
  const isUploading = result.status === 'uploading';
  const isProcessing = result.status === 'processing';
  const isSuccess = result.status === 'success' && !!result.outputUrl;
  const isFailure = result.status === 'failure';

  return (
    <Pressable
      disabled={isUploading || isProcessing}
      onPress={() => {
        if (isSuccess) {
          onPress(result.style);
          return;
        }

        if (isFailure) {
          onRetry?.(result.style);
        }
      }}
      className={`relative m-1.5 aspect-square flex-1 overflow-hidden rounded-[24px] border-2 ${
        isSuccess
          ? 'border-tertiary bg-surface_container'
          : isFailure
            ? 'border-error bg-[#1f1618]'
            : 'border-transparent bg-surface_container'
      }`}
    >
      {(isUploading || isProcessing) && <SkeletonCard />}

      {isProcessing && (
        <View className="absolute right-3 top-3 z-10 h-8 w-8 items-center justify-center rounded-full bg-black/45">
          <ActivityIndicator color="#ffffff" size="small" />
        </View>
      )}

      {isSuccess && (
        <>
          <Image
            source={{ uri: result.outputUrl as string }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-tertiary">
            <CircleCheckBig color="#ffffff" size={18} strokeWidth={2.4} />
          </View>
        </>
      )}

      {isFailure && (
        <View className="flex-1 items-center justify-center px-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-error/15">
            <CircleAlert color="#f2b8b5" size={26} strokeWidth={2.2} />
          </View>
          <Text className="mt-3 text-center text-sm font-bold text-error">
            {onRetry ? 'Tap to retry' : 'Generation failed'}
          </Text>
          {result.error ? (
            <Text className="mt-1 text-center text-xs leading-4 text-error/75">{result.error}</Text>
          ) : null}
        </View>
      )}

      {!isFailure && (
        <View className="absolute inset-x-0 bottom-0 p-3">
          <View className="self-start rounded-xl bg-black/65 px-3 py-1.5">
            <Text className="text-[11px] font-black uppercase tracking-widest text-white">
              {getStyleLabel(result.style)}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
