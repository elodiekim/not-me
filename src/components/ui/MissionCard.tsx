import { Image, ImageSourcePropType, Text, View } from 'react-native';
import { Badge } from './Badge';
import { Card } from './Card';

type MissionCardStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface MissionCardProps {
  avatar: ImageSourcePropType;
  title: string;
  subtitle?: string;
  statusLabel: string;
  statusVariant?: MissionCardStatus;
}

export function MissionCard({
  avatar,
  title,
  subtitle,
  statusLabel,
  statusVariant = 'info',
}: MissionCardProps) {
  return (
    <Card>
      <View className="flex-row items-center gap-4">
        <View className="items-center justify-center rounded-full bg-primary/20 p-2">
          <Image source={avatar} style={{ width: 48, height: 48 }} resizeMode="contain" />
        </View>
        <View className="flex-1 gap-1">
          <Badge label={statusLabel} variant={statusVariant} />
          <Text className="text-lg font-sans-bold text-text-primary">{title}</Text>
          {subtitle && <Text className="text-sm text-text-secondary">{subtitle}</Text>}
        </View>
      </View>
    </Card>
  );
}
