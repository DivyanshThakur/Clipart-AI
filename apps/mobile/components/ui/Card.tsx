import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View 
      className={`rounded-2xl bg-surface_container p-6 border border-outline_variant ${className || ''}`} 
      {...props}
    >
      {children}
    </View>
  );
}
