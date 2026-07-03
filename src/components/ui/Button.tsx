import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary', text: 'text-text-primary' },
  secondary: { container: 'bg-background border border-text-primary', text: 'text-text-primary' },
  ghost: { container: 'bg-transparent', text: 'text-text-primary' },
  danger: { container: 'bg-danger', text: 'text-white' },
};

export function Button({ label, variant = 'primary', loading = false, icon, disabled, ...props }: ButtonProps) {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      className={`h-14 items-center justify-center rounded-button px-6 ${styles.container} ${
        isDisabled ? 'opacity-50' : ''
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'danger' ? '#FFFFFF' : '#111111'} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`text-base font-sans-semibold ${styles.text}`}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
