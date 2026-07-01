import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, radius, spacing } from '../theme';
import { COMING_SOON } from '../types';

type Props = { onRequestHelp: () => void };

export default function HomeScreen({ onRequestHelp }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🪳</Text>
        <Text style={styles.title}>A cockroach appeared.</Text>
        <BigButton label="Request Help" onPress={onRequestHelp} />
      </View>

      <View style={styles.comingSoonSection}>
        <Text style={styles.comingSoonHeader}>Coming Soon</Text>
        <View style={styles.grid}>
          {COMING_SOON.map((item) => (
            <View key={item.label} style={styles.card}>
              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.black,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  comingSoonSection: {
    marginTop: spacing.lg,
  },
  comingSoonHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.lightGray,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray,
    textAlign: 'center',
  },
});
