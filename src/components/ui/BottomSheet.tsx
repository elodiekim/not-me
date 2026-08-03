import { ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Design-system "Bottom Sheet" component (DESIGN.md: rounded-sheet, large soft
// shadow) — full-width, flush to the bottom edge, only the top corners rounded.
// Tapping the scrim (anything outside the sheet) dismisses it.
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
    </Modal>
  );
}
