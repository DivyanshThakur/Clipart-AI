import React from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { AppScreen, ScreenContainer } from '../components/layout/AppScreen';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { StyleCard } from '../components/style-card/StyleCard';
import { Button } from '../components/ui/Button';
import { STYLE_OPTIONS } from '../constants/styles';
import { useGeneration } from '../hooks/useGeneration';
import { useGoHome } from '../hooks/useGoHome';
import { useResponsiveGrid } from '../hooks/useResponsiveGrid';
import { useGenerationStore } from '../store/generationStore';
import type { StyleKey } from '../types';

type StyleGridItem = (typeof STYLE_OPTIONS)[number] | { key: `placeholder-${number}`; isPlaceholder: true };

export default function StyleSelectionScreen() {
  const router = useRouter();
  const goHome = useGoHome();
  const { imageUri, selectedStyles, setSelectedStyles } = useGenerationStore(
    useShallow((state) => ({
      imageUri: state.imageUri,
      selectedStyles: state.selectedStyles,
      setSelectedStyles: state.setSelectedStyles,
    }))
  );
  const { generate, loading } = useGeneration();
  const { horizontalPaddingClassName, numColumns, paddedItems } =
    useResponsiveGrid<StyleGridItem, StyleGridItem>(
      STYLE_OPTIONS,
      (index) => ({ key: `placeholder-${index}`, isPlaceholder: true })
    );

  const toggleStyle = (id: StyleKey) => {
    setSelectedStyles((previous) =>
      previous.includes(id) ? previous.filter((style) => style !== id) : [...previous, id]
    );
  };

  const selectAll = () => {
    if (selectedStyles.length === STYLE_OPTIONS.length) {
      setSelectedStyles([]);
      return;
    }

    setSelectedStyles(STYLE_OPTIONS.map((style) => style.key));
  };

  const handleGenerate = async () => {
    if (!imageUri) {
      Alert.alert('Image required', 'Please go back and choose an image first.');
      return;
    }

    await generate(imageUri, selectedStyles);
  };

  return (
    <AppScreen>
      <View className="flex-1 items-center">
        <ScreenContainer horizontalPaddingClassName={horizontalPaddingClassName}>
          <FlatList
            key={numColumns}
            data={paddedItems}
            numColumns={numColumns}
            keyExtractor={(item) => item.key}
            ListHeaderComponent={
              <View>
                <ScreenHeader
                  title="Style Selection"
                  onBack={() => router.back()}
                  onHome={goHome}
                />

                <View className="mb-4 flex-row justify-end px-2">
                  <Pressable onPress={selectAll} hitSlop={15}>
                    <Text className="font-semibold text-[14px] text-tertiary">
                      {selectedStyles.length === STYLE_OPTIONS.length ? 'Deselect All' : 'Select All'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            }
            renderItem={({ item }) => {
              if ('isPlaceholder' in item && item.isPlaceholder) {
                return <View className="m-1.5 flex-1" />;
              }

              const styleItem = item as (typeof STYLE_OPTIONS)[number];

              return (
                <StyleCard
                  id={styleItem.key}
                  name={styleItem.name}
                  image={styleItem.image}
                  selected={selectedStyles.includes(styleItem.key)}
                  onSelect={toggleStyle}
                />
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </ScreenContainer>

        <View className="absolute bottom-8 left-6 right-6 max-w-[500px] self-center">
          <Button
            disabled={selectedStyles.length === 0 || loading}
            className={`w-full rounded-[20px] py-4 ${
              selectedStyles.length === 0 || loading ? 'bg-outline opacity-40' : 'bg-tertiary'
            }`}
            onPress={() => {
              void handleGenerate();
            }}
          >
            <Text className="text-base font-bold text-white">
              {loading
                ? 'Starting...'
                : `Generate ${selectedStyles.length} Variation${selectedStyles.length !== 1 ? 's' : ''}`}
            </Text>
          </Button>
        </View>
      </View>
    </AppScreen>
  );
}
