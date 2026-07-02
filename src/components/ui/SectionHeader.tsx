import { Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {title}
    </Text>
  );
}
