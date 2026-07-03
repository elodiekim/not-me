import { forwardRef, ReactNode, useId } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  error?: string;
}

const NUMERIC_KEYBOARD_TYPES = ['decimal-pad', 'number-pad', 'numeric'];

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, leftIcon, error, keyboardType, returnKeyType, ...props },
  ref
) {
  const accessoryId = useId();
  const showDoneAccessory =
    Platform.OS === 'ios' && !!keyboardType && NUMERIC_KEYBOARD_TYPES.includes(keyboardType);

  return (
    <View>
      {label && <Text className="mb-2 text-sm font-sans-medium text-text-primary">{label}</Text>}
      <View
        className={`h-14 flex-row items-center rounded-input border bg-surface px-4 ${
          error ? 'border-danger' : 'border-transparent'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor="#AAAAAA"
          className="flex-1 font-sans text-base text-text-primary"
          style={{ paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false }}
          keyboardType={keyboardType}
          returnKeyType={showDoneAccessory ? undefined : returnKeyType}
          inputAccessoryViewID={showDoneAccessory ? accessoryId : undefined}
          {...props}
        />
      </View>
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}

      {showDoneAccessory && (
        <InputAccessoryView nativeID={accessoryId}>
          <View className="flex-row justify-end border-t border-surface bg-background px-4 py-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done"
              onPress={Keyboard.dismiss}
              className="rounded-button bg-primary px-4 py-1.5"
            >
              <Text className="text-sm font-sans-semibold text-text-primary">Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
});
