import { StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, spacing } from '../theme';

type Props = { onReview: () => void; onHome: () => void };

export default function CompleteScreen({ onReview, onHome }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🏆</Text>
      <Text style={styles.title}>Mission complete.</Text>
      <Text style={styles.subtitle}>Humanity wins again.</Text>
      <Text style={styles.detail}>The cockroach has been defeated.</Text>

      <View style={styles.spacer} />
      <BigButton label="Leave a Review" onPress={onReview} />
      <BigButton label="Back to Home" variant="outline" onPress={onHome} />
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.green,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    color: colors.gray,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  spacer: {
    height: spacing.xxl,
  },
});
