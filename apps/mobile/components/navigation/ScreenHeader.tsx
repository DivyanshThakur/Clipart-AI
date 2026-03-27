import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronLeft, House } from 'lucide-react-native';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  onHome?: () => void;
  showHome?: boolean;
  rightSlot?: ReactNode;
};

function HeaderIconButton({
  children,
  disabled,
  onPress,
}: {
  children: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full bg-surface_container_low active:opacity-70"
    >
      {children}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  onBack,
  onHome,
  showHome = true,
  rightSlot,
}: ScreenHeaderProps) {
  return (
    <View className="relative h-14 flex-row items-center justify-between">
      <HeaderIconButton onPress={onBack}>
        <ChevronLeft size={20} color="#e5e2e1" />
      </HeaderIconButton>

      <View className="pointer-events-none absolute inset-x-0 items-center justify-center px-14">
        <Text
          className="text-[20px] font-bold text-on_surface"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {rightSlot}
        {showHome ? (
          <HeaderIconButton onPress={onHome}>
            <House size={18} color="#e5e2e1" />
          </HeaderIconButton>
        ) : null}
        {!rightSlot && !showHome ? <View className="h-10 w-10" /> : null}
      </View>
    </View>
  );
}
