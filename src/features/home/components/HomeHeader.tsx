import { Image, View } from 'react-native';

export function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between">
      <Image
        source={require('../../../../assets/logo/brand-logo.png')}
        style={{ width: 96, height: 32 }}
        resizeMode="contain"
      />
      <Image
        source={require('../../../../assets/icons/bell.png')}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    </View>
  );
}
