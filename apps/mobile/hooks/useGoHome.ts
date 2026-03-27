import { useCallback } from 'react';
import { router } from 'expo-router';

export function useGoHome() {
  return useCallback(() => {
    router.dismissAll();
    router.replace('/');
  }, []);
}
