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
import { COLORS } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  error?: string;
}

const NUMERIC_KEYBOARD_TYPES = ['decimal-pad', 'number-pad', 'numeric'];

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, leftIcon, error, keyboardType, returnKeyType, multiline, ...props },
  ref,
) {
  const accessoryId = useId();
  const showDoneAccessory =
    Platform.OS === 'ios' && !!keyboardType && NUMERIC_KEYBOARD_TYPES.includes(keyboardType);

  return (
    <View>
      {label && (
        <Text className="mb-2 px-4 text-sm font-sans-medium text-text-primary">{label}</Text>
      )}
      <View
        className={`flex-row rounded-input border bg-surface px-4 ${
          // items-start (not items-stretch) would cap the TextInput's own
          // height at its single line of text, instead of letting it fill
          // this taller box — everything below that line would visually be
          // part of the input but not actually part of it, so tapping there
          // wouldn't focus it. items-stretch (the row's default, kept
          // explicit here for clarity) plus textAlignVertical: 'top' below
          // gets both: a fully tappable box with text still anchored to the
          // top instead of vertically centered in all that extra height.
          multiline ? 'min-h-24 items-stretch py-3' : 'h-14 items-center'
        } ${error ? 'border-danger' : 'border-transparent'}`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor={COLORS.textDisabled}
          className="flex-1 font-sans text-base text-text-primary"
          style={{
            paddingVertical: 0,
            textAlignVertical: multiline ? 'top' : 'center',
            includeFontPadding: false,
          }}
          keyboardType={keyboardType}
          returnKeyType={showDoneAccessory ? undefined : returnKeyType}
          inputAccessoryViewID={showDoneAccessory ? accessoryId : undefined}
          multiline={multiline}
          {...props}
        />
      </View>
      {error && <Text className="font-sans mt-1 text-xs text-danger">{error}</Text>}

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
