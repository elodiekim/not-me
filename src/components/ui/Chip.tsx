import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border px-4 py-2 ${
        selected ? 'border-primary bg-primary' : 'border-text-disabled bg-background'
      }`}
    >
      <Text className={`text-sm font-sans-medium ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
