import { useEffect, useState } from 'react';
import { AccessibilityInfo, AccessibilityChangeEventName } from 'react-native';

export function useAccessibility() {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isGrayscaleEnabled, setIsGrayscaleEnabled] = useState(false);

  useEffect(() => {
    // Check initial states
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    AccessibilityInfo.isBoldTextEnabled?.().then(setIsBoldTextEnabled);
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduceMotionEnabled);
    AccessibilityInfo.isGrayscaleEnabled?.().then(setIsGrayscaleEnabled);

    // Set up listeners
    const listeners = [
      AccessibilityInfo.addEventListener(
        'screenReaderChanged' as AccessibilityChangeEventName,
        setIsScreenReaderEnabled
      ),
      AccessibilityInfo.addEventListener(
        'boldTextChanged' as AccessibilityChangeEventName,
        setIsBoldTextEnabled
      ),
      AccessibilityInfo.addEventListener(
        'reduceMotionChanged' as AccessibilityChangeEventName,
        setIsReduceMotionEnabled
      ),
      AccessibilityInfo.addEventListener(
        'grayscaleChanged' as AccessibilityChangeEventName,
        setIsGrayscaleEnabled
      ),
    ];

    return () => {
      listeners.forEach(listener => listener?.remove());
    };
  }, []);

  const announceForAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const focusOnElement = (ref: any) => {
    if (ref?.current && isScreenReaderEnabled) {
      const reactTag = ref.current;
      AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  return {
    isScreenReaderEnabled,
    isBoldTextEnabled,
    isReduceMotionEnabled,
    isGrayscaleEnabled,
    announceForAccessibility,
    focusOnElement,
  };
}

export const accessibilityProps = {
  button: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'button' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  header: (label: string, level?: number) => ({
    accessible: true,
    accessibilityRole: 'header' as const,
    accessibilityLabel: label,
    'aria-level': level,
  }),

  image: (label: string) => ({
    accessible: true,
    accessibilityRole: 'image' as const,
    accessibilityLabel: label,
  }),

  link: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'link' as const,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),

  text: (label: string) => ({
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: label,
  }),

  adjustable: (label: string, value: string, hint?: string) => ({
    accessible: true,
    accessibilityRole: 'adjustable' as const,
    accessibilityLabel: label,
    accessibilityValue: { text: value },
    accessibilityHint: hint,
  }),

  state: (label: string, selected?: boolean, disabled?: boolean) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityState: {
      selected,
      disabled,
    },
  }),
};