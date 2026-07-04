import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';

const PRESET_AMOUNTS = [10, 20];

export function RewardScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | 'custom' | null>(null);
  const [customValue, setCustomValue] = useState('');

  const amount = useMemo(() => {
    if (selected === 'custom') {
      const parsed = Number(customValue);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return selected;
  }, [selected, customValue]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Pressable className="flex-1" onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-row items-center px-6 py-4">
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#111111" />
          </Pressable>
          <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Set Your Reward</Text>
        </View>

        <View className="flex-1 gap-6 px-6">
          <View className="gap-1">
            <Text className="text-2xl font-sans-bold text-text-primary">How much will you offer?</Text>
            <Text className="font-sans text-sm text-text-secondary">
              Offering a reward helps you get help faster.{'\n'}리워드를 제안하면 더 빠르게 도움을 받을 수 있어요.
            </Text>
          </View>

          <View className="gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Pressable key={preset} onPress={() => setSelected(preset)}>
                <View className={`items-center rounded-input py-4 ${selected === preset ? 'bg-primary/15' : 'bg-surface'}`}>
                  <Text className="text-base font-sans-bold text-text-primary">${preset}</Text>
                </View>
              </Pressable>
            ))}
            <Pressable onPress={() => setSelected('custom')}>
              <View className={`items-center rounded-input py-4 ${selected === 'custom' ? 'bg-primary/15' : 'bg-surface'}`}>
                <Text className="text-base font-sans-bold text-text-primary">Custom amount</Text>
              </View>
            </Pressable>
          </View>

          {selected === 'custom' && (
            <Input
              label="Custom Amount"
              placeholder="0"
              keyboardType="decimal-pad"
              value={customValue}
              onChangeText={setCustomValue}
              leftIcon={<Text className="text-base font-sans-semibold text-text-primary">$</Text>}
            />
          )}
        </View>

        <View className="px-6 pb-6">
          <Button
            label={amount ? `Request Help · $${amount}` : 'Request Help'}
            variant="primary"
            disabled={!amount}
            onPress={() => router.push({ pathname: '/searching', params: { amount: String(amount) } })}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
