import { Image, ImageSourcePropType, View } from 'react-native';

const DEFAULT_AVATAR = require('../../../assets/characters/avatar-cat.png');

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<AvatarSize, number> = { sm: 32, md: 48, lg: 64 };

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: AvatarSize;
}

export function Avatar({ source, size = 'md' }: AvatarProps) {
  const dimension = SIZE_MAP[size];
  return (
    <View
      className="overflow-hidden rounded-full bg-surface"
      style={{ width: dimension, height: dimension }}
    >
      <Image
        source={source ?? DEFAULT_AVATAR}
        style={{ width: dimension, height: dimension }}
        resizeMode="cover"
      />
    </View>
  );
}
