import { StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, spacing } from '../theme';

type Props = { onHome: () => void };

export default function CancelledScreen({ onHome }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💨</Text>
      <Text style={styles.title}>Mission cancelled.</Text>
      <Text style={styles.subtitle}>The cockroach survives another day.</Text>

      <View style={styles.spacer} />
      <BigButton label="Back to Home" onPress={onHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.black,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  spacer: {
    height: spacing.xxl,
  },
});
