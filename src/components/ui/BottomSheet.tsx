import { ReactNode, useEffect, useRef } from 'react';
import { Animated, BackHandler, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const FADE_MS = 200;

// Design-system "Bottom Sheet" component (DESIGN.md: rounded-sheet, large soft
// shadow) — full-width, flush to the bottom edge, only the top corners rounded.
// Tapping the scrim (anything outside the sheet) dismisses it.
//
// Not built on RN's Modal: on web, Modal portals its content straight to
// document.body, escaping the phone-width `#root` frame (global.css) that
// every other screen renders inside — it was rendering edge-to-edge of the
// whole browser window instead of the mobile frame. A plain absolutely-
// positioned View stays inside the normal component tree (and so inside
// that frame on web), while still covering the full screen on native. The
// tradeoff is reimplementing the two things Modal gave for free: a fade-in
// (Animated, same pattern as Toast.tsx) and the Android hardware back button.
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: false }).start();

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => {
      sub.remove();
      opacity.setValue(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity, zIndex: 50 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        {/* Own Pressable so taps inside the sheet don't bubble to the scrim above */}
        <Pressable onPress={() => {}}>
          <View
            className="rounded-t-sheet bg-background"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -4 },
              elevation: 8,
            }}
          >
            <SafeAreaView edges={['bottom']}>
              <View className="gap-3 p-6">{children}</View>
            </SafeAreaView>
          </View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}
