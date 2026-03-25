import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  haptic?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  leftIcon, 
  rightIcon, 
  haptic = true,
  className,
  onPress,
  ...props 
}: ButtonProps) {
  const handlePress = (e: any) => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(e);
  };

  let bgClass = "bg-primary_container";
  let textClass = "text-on_primary";
  let borderClass = "border border-transparent";

  if (variant === 'secondary') {
    bgClass = "bg-secondary_container";
    textClass = "text-on_secondary_container";
  } else if (variant === 'outline') {
    bgClass = "bg-transparent";
    textClass = "text-primary";
    borderClass = "border border-outline";
  } else if (variant === 'ghost') {
    bgClass = "bg-transparent";
    textClass = "text-primary";
  }

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={handlePress}
      className={`flex-row items-center justify-center rounded-full px-6 py-4 ${bgClass} ${borderClass} ${className || ''}`}
      {...props}
    >
      {leftIcon && <View className="mr-2.5">{leftIcon}</View>}
      <Text className={`font-semibold text-body-md ${textClass}`}>
        {children}
      </Text>
      {rightIcon && <View className="ml-2.5">{rightIcon}</View>}
    </TouchableOpacity>
  );
}
