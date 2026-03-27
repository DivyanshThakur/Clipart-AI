import React, { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

type AppScreenProps = {
  children: ReactNode;
  edges?: Edge[];
  className?: string;
};

type ScreenContainerProps = ViewProps & {
  children: ReactNode;
  horizontalPaddingClassName?: string;
  maxWidth?: number;
};

export function AppScreen({
  children,
  edges = ['top', 'bottom'],
  className,
}: AppScreenProps) {
  return (
    <SafeAreaView
      className={`flex-1 bg-background ${className ?? ''}`}
      edges={edges}
    >
      <View className="flex-1 bg-background">{children}</View>
    </SafeAreaView>
  );
}

export function ScreenContainer({
  children,
  className,
  horizontalPaddingClassName = 'px-6',
  maxWidth = 1200,
  style,
  ...props
}: ScreenContainerProps) {
  return (
    <View
      className={`w-full self-center ${horizontalPaddingClassName} ${className ?? ''}`}
      style={[{ maxWidth }, style]}
      {...props}
    >
      {children}
    </View>
  );
}
