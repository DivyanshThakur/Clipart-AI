import { type ImageSourcePropType, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import type { StyleKey } from '../../types';

interface StyleCardProps {
  id: StyleKey;
  name: string;
  image: ImageSourcePropType;
  selected: boolean;
  onSelect: (id: StyleKey) => void;
}

export function StyleCard({ id, name, image, selected, onSelect }: StyleCardProps) {
  return (
    <Pressable
      onPress={() => onSelect(id)}
      className={`relative aspect-square flex-1 m-1.5 overflow-hidden rounded-[24px] border-2 bg-surface_container active:opacity-90 ${selected ? 'border-tertiary' : 'border-transparent'
        }`}
    >
      <Image
        source={image}
        contentFit="cover"
        style={{ width: '100%', height: '100%' }}
        transition={200}
      />
      
      {/* Label Overlay */}
      <View className="absolute inset-0 justify-end p-4">
        <View className="absolute inset-x-0 bottom-0 h-1/2" />
        <Text className="font-bold text-[18px] leading-6 text-white" style={{ textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
          {name}
        </Text>
      </View>

      {/* Selection Indicator */}
      {selected && (
        <View className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full bg-tertiary">
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        </View>
      )}
    </Pressable>
  );
}
