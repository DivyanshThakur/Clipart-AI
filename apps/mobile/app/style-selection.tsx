import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StyleCard } from '../components/style-card/StyleCard';
import { Button } from '../components/ui/Button';

const STYLES = [
  { id: 'anime', name: 'Anime', image: require('../assets/images/anime.png') },
  { id: 'cartoon', name: 'Cartoon', image: require('../assets/images/cartoon.png') },
  { id: 'pixel_art', name: 'Pixel Art', image: require('../assets/images/pixel_art.png') },
  { id: 'flat_illustration', name: 'Flat Illustration', image: require('../assets/images/flat_illustration.png') },
  { id: 'sketch', name: 'Sketch', image: require('../assets/images/sketch.png') },
  { id: 'comic_book', name: 'Comic Book', image: require('../assets/images/comic_book.png') },
];

export default function StyleSelectionScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  // Adjusted column calculation for better proportions
  const numColumns = width < 450 ? 2 : width < 900 ? 3 : 4;
  const horizontalPadding = width < 500 ? 'px-4' : 'px-8';

  const toggleStyle = (id: string) => {
    setSelectedStyles(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStyles.length === STYLES.length) {
      setSelectedStyles([]);
    } else {
      setSelectedStyles(STYLES.map(s => s.id));
    }
  };

  // Pad data with placeholders to ensure consistent card width in the last row
  const paddedStyles = React.useMemo(() => {
    const arr: any[] = [...STYLES];
    const numToPad = (numColumns - (STYLES.length % numColumns)) % numColumns;
    for (let i = 0; i < numToPad; i++) {
      arr.push({ id: `placeholder-${i}`, name: '', image: null, isPlaceholder: true });
    }
    return arr;
  }, [numColumns]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-1 items-center">
        <View 
          className={`w-full ${horizontalPadding}`}
          style={{ maxWidth: 1200 }}
        >
          {/* Style Selection Grid */}
          <FlatList
            key={numColumns}
            data={paddedStyles}
            numColumns={numColumns}
            keyExtractor={item => item.id}
            ListHeaderComponent={(
              <View>
                {/* Header */}
                <View className="mb-2 h-14 flex-row items-center justify-between">
                  <Pressable 
                    onPress={() => router.back()} 
                    className="h-10 w-10 items-center justify-center rounded-full bg-surface_container_low active:opacity-70"
                  >
                    <ChevronLeft size={20} color="#e5e2e1" />
                  </Pressable>
                  <Text className="font-bold text-[20px] leading-7 text-on_surface">Style Selection</Text>
                  <View className="w-10" />
                </View>

                {/* Select All Action */}
                <View className="mb-4 flex-row justify-end px-2">
                  <Pressable onPress={selectAll} hitSlop={15}>
                    <Text className="font-semibold text-[14px] text-tertiary">
                      {selectedStyles.length === STYLES.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
            renderItem={({ item }: { item: any }) => {
              if (item.isPlaceholder) {
                return <View className="flex-1 m-1.5" />;
              }
              return (
                <StyleCard
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  selected={selectedStyles.includes(item.id)}
                  onSelect={toggleStyle}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>

        <View className="absolute bottom-8 left-6 right-6 max-w-[500px] self-center">
          <Button
            disabled={selectedStyles.length === 0}
            className={`w-full py-4 rounded-[20px] ${selectedStyles.length === 0 ? 'bg-outline opacity-40' : 'bg-tertiary'}`}
            onPress={() => router.push('/results')}
          >
            <Text className="text-base font-bold text-white">
              Generate {selectedStyles.length} Variation{selectedStyles.length !== 1 ? 's' : ''}
            </Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
