import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { MAX_REWARD_AMOUNT } from '../../constants/mission';

const PRESET_AMOUNTS = [10, 20];

// 정수부 + 선택적 소수점 2자리까지만 허용 (예: 10, 10.1, 10.12는 되고 10.123은 안 됨)
const CUSTOM_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function RewardScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | 'custom' | null>(null);
  const [customValue, setCustomValue] = useState('');

  const amount = useMemo(() => {
    if (selected === 'custom') {
      if (!CUSTOM_AMOUNT_PATTERN.test(customValue)) return null;
      const parsed = Number(customValue);
      return parsed > 0 && parsed <= MAX_REWARD_AMOUNT ? parsed : null;
    }
    return selected;
  }, [selected, customValue]);

  const customAmountError = useMemo(() => {
    if (selected !== 'custom' || !customValue) return undefined;
    const parsed = Number(customValue);
    if (Number.isFinite(parsed) && parsed > MAX_REWARD_AMOUNT) {
      return `Max $${MAX_REWARD_AMOUNT} · 최대 $${MAX_REWARD_AMOUNT}까지 가능해요`;
    }
    return undefined;
  }, [selected, customValue]);

  const handleConfirm = () => {
    if (!amount) return;
    router.push({ pathname: '/confirm-location', params: { amount: String(amount) } });
  };

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
              error={customAmountError}
              leftIcon={<Text className="text-base font-sans-semibold text-text-primary">$</Text>}
            />
          )}
        </View>

        <View className="px-6 pb-6">
          <Button
            label={amount ? `Request Help · $${amount}` : 'Request Help'}
            variant="primary"
            disabled={!amount}
            onPress={handleConfirm}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
