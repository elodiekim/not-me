import { StyleSheet, Text, View } from 'react-native';
import BigButton from './BigButton';
import { colors, spacing } from '../theme';

type Option = { label: string; value: string };

type Props = {
  step: string;
  question: string;
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;
};

export default function StepScreen({ step, question, options, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((opt) => (
          <BigButton
            key={opt.value}
            label={opt.label}
            variant="outline"
            selected={selected === opt.value}
            onPress={() => onSelect(opt.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  step: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  question: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.black,
    marginBottom: spacing.xl,
  },
  options: {
    marginTop: spacing.md,
  },
});
