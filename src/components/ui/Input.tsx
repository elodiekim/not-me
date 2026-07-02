import { forwardRef, ReactNode } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  leftIcon?: ReactNode;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, leftIcon, error, ...props },
  ref
) {
  return (
    <View>
      {label && <Text className="mb-2 text-sm font-medium text-text-primary">{label}</Text>}
      <View
        className={`h-14 flex-row items-center rounded-input border bg-surface px-4 ${
          error ? 'border-danger' : 'border-transparent'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          ref={ref}
          placeholderTextColor="#AAAAAA"
          className="flex-1 text-base text-text-primary"
          {...props}
        />
      </View>
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}
    </View>
  );
});
