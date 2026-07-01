import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  selected?: boolean;
};

export default function BigButton({ label, onPress, variant = 'primary', selected }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  primary: {
    backgroundColor: colors.black,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.black,
  },
  selected: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
  },
  textPrimary: {
    color: colors.white,
  },
  textOutline: {
    color: colors.black,
  },
});
