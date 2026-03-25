import React, { ReactNode } from 'react';
import { View, Text, ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'error' | 'success'; 
}

export function Badge({ children, variant = 'primary', className, ...props }: BadgeProps) {
  let bgClass = "bg-primary_container";
  let textClass = "text-on_primary_container";

  if (variant === 'secondary') {
    bgClass = "bg-secondary_container";
    textClass = "text-on_secondary_container";
  } else if (variant === 'error') {
    bgClass = "bg-error_container";
    textClass = "text-on_error_container";
  } else if (variant === 'success') {
    bgClass = "bg-tertiary_container"; 
    textClass = "text-on_tertiary_container";
  }

  return (
    <View 
      className={`rounded-full px-3 py-1 items-center justify-center self-start ${bgClass} ${className || ''}`} 
      {...props}
    >
      <Text className={`font-bold text-[10px] tracking-wider uppercase ${textClass}`}>
        {children}
      </Text>
    </View>
  );
}
