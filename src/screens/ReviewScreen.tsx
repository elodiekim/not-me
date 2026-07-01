import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BigButton from '../components/BigButton';
import { colors, spacing } from '../theme';
import { Mission } from '../types';

type Props = { mission: Mission; onDone: () => void };

export default function ReviewScreen({ mission, onDone }: Props) {
  const [stars, setStars] = useState(5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How did {mission.helperName} do?</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)}>
            <Text style={[styles.star, n <= stars && styles.starActive]}>★</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.spacer} />
      <BigButton label="Submit Review" onPress={onDone} />
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.black,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  star: {
    fontSize: 40,
    color: '#D9D9DE',
  },
  starActive: {
    color: colors.yellow,
  },
  spacer: {
    height: spacing.xxl,
  },
});
