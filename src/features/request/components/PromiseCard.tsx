import { Image, Text, View } from 'react-native';
import { Card, SectionHeader } from '../../../components/ui';
import { PROMISE_ITEMS } from '../data/promises';

export function PromiseCard() {
  return (
    <View className="gap-3">
      <SectionHeader title="Our Promise" />
      <Card>
        <View className="flex-row items-center gap-4">
          <View className="flex-1 gap-4">
            {PROMISE_ITEMS.map((item) => (
              <View key={item.id} className="flex-row items-start gap-3">
                <Image source={item.icon} style={{ width: 24, height: 24 }} resizeMode="contain" />
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-text-primary">{item.title}</Text>
                  <Text className="text-xs text-text-secondary">{item.koDescription}</Text>
                </View>
              </View>
            ))}
          </View>
          <Image
            source={require('../../../../assets/characters/proud-cat.png')}
            style={{ width: 110, height: 150 }}
            resizeMode="contain"
          />
        </View>
      </Card>
    </View>
  );
}
