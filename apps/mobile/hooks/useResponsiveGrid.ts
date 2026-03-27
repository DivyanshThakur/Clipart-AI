import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

type PlaceholderFactory<TPlaceholder> = (index: number) => TPlaceholder;

export function useResponsiveGrid<TItem, TPlaceholder>(
  items: readonly TItem[],
  createPlaceholder: PlaceholderFactory<TPlaceholder>
) {
  const { width } = useWindowDimensions();
  const numColumns = width < 450 ? 2 : width < 900 ? 3 : 4;
  const horizontalPaddingClassName = width < 500 ? 'px-4' : 'px-8';

  const paddedItems = useMemo(() => {
    const nextItems: Array<TItem | TPlaceholder> = [...items];
    const numToPad = (numColumns - (items.length % numColumns)) % numColumns;

    for (let index = 0; index < numToPad; index += 1) {
      nextItems.push(createPlaceholder(index));
    }

    return nextItems;
  }, [createPlaceholder, items, numColumns]);

  return {
    horizontalPaddingClassName,
    numColumns,
    paddedItems,
  };
}
