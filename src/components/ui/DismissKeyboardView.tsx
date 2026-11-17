import { ReactNode } from 'react';
import { Keyboard, Platform, Pressable, View } from 'react-native';

// Tapping outside a focused input should dismiss the keyboard — but wrapping
// the whole screen in a Pressable to do that breaks every TextInput inside
// it on web: react-native-web's Pressable calls preventDefault() on
// pointerdown (part of its own press-state tracking), which suppresses the
// browser's default "focus the element under the pointer" behavior for every
// descendant, including native <input> elements — clicking into a field
// never focuses it, so nothing typed ever registers. Keyboard.dismiss is
// also a no-op on web (no software keyboard to dismiss), so there's nothing
// this wrapper needs to do there anyway. Falls back to a plain View on web;
// unchanged Pressable-based dismiss-on-tap-outside on native.
export function DismissKeyboardView({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (Platform.OS === 'web') {
    return <View className={className}>{children}</View>;
  }

  return (
    <Pressable className={className} onPress={Keyboard.dismiss} accessible={false}>
      {children}
    </Pressable>
  );
}
