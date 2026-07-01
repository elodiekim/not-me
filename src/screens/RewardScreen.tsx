import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, radius, spacing } from '../theme';

type Props = { onSelect: (reward: number) => void };

export default function RewardScreen({ onSelect }: Props) {
  const [custom, setCustom] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3</Text>
      <Text style={styles.question}>Reward</Text>

      <BigButton label="$10" variant="outline" onPress={() => onSelect(10)} />
      <BigButton label="$20" variant="outline" onPress={() => onSelect(20)} />
      <BigButton
        label="Custom"
        variant="outline"
        selected={showCustom}
        onPress={() => setShowCustom(true)}
      />

      {showCustom && (
        <View style={styles.customRow}>
          <Text style={styles.dollar}>$</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Amount"
            value={custom}
            onChangeText={setCustom}
            autoFocus
          />
          <BigButton
            label="Confirm"
            onPress={() => onSelect(Number(custom) || 0)}
          />
        </View>
      )}
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
  customRow: {
    marginTop: spacing.md,
  },
  dollar: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 18,
    marginBottom: spacing.md,
  },
});
