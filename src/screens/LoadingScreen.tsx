import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

const MESSAGES = [
  'Looking for someone braver than you...',
  'Searching nearby heroes...',
  'Negotiating with local legends...',
  'Stay calm.',
  'Help is on the way.',
];

type Props = { onDone: () => void };

export default function LoadingScreen({ onDone }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 900);
    const doneTimer = setTimeout(onDone, 3200);
    return () => {
      clearInterval(messageTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🪳</Text>
      <ActivityIndicator size="large" color={colors.orange} style={styles.spinner} />
      <Text style={styles.message}>{MESSAGES[index]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emoji: {
    fontSize: 56,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
  },
});
