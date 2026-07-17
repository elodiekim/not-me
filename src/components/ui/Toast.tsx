import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

interface ToastProps {
  message: string;
  // Called once the toast has fully faded out, so the parent can drop it from the
  // tree (and reset any "show" state) without needing its own timer.
  onDismiss: () => void;
  // Visible-and-holding time between fade in and fade out.
  durationMs?: number;
}

const FADE_MS = 200;

// Lightweight confirmation banner — RN Animated only, no toast library. Handles its
// own timing: fade in, hold for durationMs, fade out, then onDismiss.
// NativeWind doesn't apply className to Animated.View, so the animated wrapper carries
// only opacity + absolute positioning via inline style; the visible banner is a plain
// styled View inside it.
export function Toast({ message, onDismiss, durationMs = 2500 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: false }),
      Animated.delay(durationMs),
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: false }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onDismiss();
    });
    return () => animation.stop();
  }, [opacity, durationMs, onDismiss]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 24, right: 24, bottom: 96, opacity, zIndex: 50, elevation: 6 }}
    >
      <View accessibilityRole="alert" className="items-center rounded-card bg-text-primary px-5 py-3">
        <Text className="font-sans-semibold text-center text-sm text-background">{message}</Text>
      </View>
    </Animated.View>
  );
}
