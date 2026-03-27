import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

type ToastTone = 'error' | 'success';

type ToastInput = {
  title: string;
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastState = ToastInput & {
  id: number;
};

type ToastListener = (toast: ToastState | null) => void;

const DEFAULT_DURATION_MS = 3200;

let activeToast: ToastState | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let nextToastId = 1;
const listeners = new Set<ToastListener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    listener(activeToast);
  });
}

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

export function hideToast() {
  clearHideTimer();
  activeToast = null;
  notifyListeners();
}

export function showToast(input: ToastInput) {
  clearHideTimer();
  activeToast = {
    id: nextToastId,
    durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
    message: input.message,
    title: input.title,
    tone: input.tone ?? 'error',
  };
  nextToastId += 1;
  notifyListeners();

  hideTimer = setTimeout(() => {
    activeToast = null;
    hideTimer = null;
    notifyListeners();
  }, activeToast.durationMs);
}

export function ToastViewport() {
  const [toast, setToast] = useState<ToastState | null>(activeToast);

  useEffect(() => {
    listeners.add(setToast);

    return () => {
      listeners.delete(setToast);
    };
  }, []);

  if (!toast) {
    return null;
  }

  const toneClasses =
    toast.tone === 'success'
      ? 'border-tertiary/60 bg-[#183726]'
      : 'border-error/60 bg-[#2d1719]';

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 top-0 z-50 px-4 pt-16">
      <Pressable onPress={hideToast} className={`rounded-3xl border px-4 py-3 shadow-2xl ${toneClasses}`}>
        <Text className="text-sm font-bold text-on_surface">{toast.title}</Text>
        <Text className="mt-1 text-sm leading-5 text-on_surface_variant">{toast.message}</Text>
      </Pressable>
    </View>
  );
}
