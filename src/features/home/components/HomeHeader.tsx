import { Image, Pressable, View } from 'react-native';

interface HomeHeaderProps {
  onBellPress: () => void;
}

export function HomeHeader({ onBellPress }: HomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Image
        source={require('../../../../assets/logo/brand-logo.png')}
        style={{ width: 96, height: 32 }}
        resizeMode="contain"
      />
      <Pressable
        onPress={onBellPress}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        // Icon is 28x28; hitSlop pads the touch target to ~44x44 (DESIGN.md a11y min).
        hitSlop={8}
      >
        <Image
          source={require('../../../../assets/icons/bell.png')}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}
