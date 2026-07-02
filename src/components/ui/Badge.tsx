import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANT_STYLES: Record<BadgeVariant, { container: string; text: string }> = {
  success: { container: 'bg-success/10', text: 'text-success' },
  warning: { container: 'bg-warning/10', text: 'text-warning' },
  danger: { container: 'bg-danger/10', text: 'text-danger' },
  info: { container: 'bg-info/10', text: 'text-info' },
  neutral: { container: 'bg-surface', text: 'text-text-secondary' },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <View className={`self-start rounded-full px-3 py-1 ${styles.container}`}>
      <Text className={`text-xs font-medium ${styles.text}`}>{label}</Text>
    </View>
  );
}
