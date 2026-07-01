import { StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, radius, spacing } from '../theme';
import { Mission } from '../types';

type Props = {
  mission: Mission;
  onComplete: () => void;
  onCancel: () => void;
};

export default function AcceptedScreen({ mission, onComplete, onCancel }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Mission accepted.</Text>
      <Text style={styles.title}>Your hero is on the way.</Text>

      <View style={styles.card}>
        <Text style={styles.helperEmoji}>🦸</Text>
        <Text style={styles.helperName}>{mission.helperName}</Text>
        <Text style={styles.helperLevel}>{mission.helperLevel}</Text>
        <View style={styles.divider} />
        <Text style={styles.detail}>📍 {mission.location}</Text>
        <Text style={styles.detail}>
          🪳 Can it fly? {mission.canFly}
        </Text>
        <Text style={styles.detail}>💰 ${mission.reward}</Text>
      </View>

      <BigButton label="Mark as Complete" onPress={onComplete} />
      <BigButton label="Cancel Mission" variant="outline" onPress={onCancel} />
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
  badge: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.black,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.lightGray,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  helperEmoji: {
    fontSize: 48,
  },
  helperName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.black,
    marginTop: spacing.sm,
  },
  helperLevel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.orange,
    marginBottom: spacing.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E5',
    marginBottom: spacing.md,
  },
  detail: {
    fontSize: 15,
    color: colors.black,
    marginBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
});
