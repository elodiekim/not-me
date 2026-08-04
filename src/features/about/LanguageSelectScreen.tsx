import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import type { AboutLang } from './lang';

const LANGUAGES: { lang: AboutLang; flag: string; label: string }[] = [
  { lang: 'en', flag: '🇺🇸', label: 'English' },
  { lang: 'kr', flag: '🇰🇷', label: '한국어' },
];

function LanguageRow({
  flag,
  label,
  onPress,
}: {
  flag: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-input border px-5 py-5"
      style={{ borderColor: COLORS.textDisabled }}
    >
      <Text style={{ fontSize: 28 }}>{flag}</Text>
      <Text className="text-xl font-sans-semibold text-text-primary">{label}</Text>
    </Pressable>
  );
}

export function LanguageSelectScreen() {
  const router = useRouter();

  const choose = (lang: AboutLang) => {
    router.push({ pathname: '/about/story', params: { lang } });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 40 }}>
        <View className="flex-1 items-center justify-center gap-8">
          <View className="items-center gap-2">
            <Image
              source={require('../../../assets/logo/brand-logo.png')}
              style={{ width: 200, height: 67 }}
              resizeMode="contain"
            />
            <Text className="font-sans text-base text-text-secondary">
              Uber for Weird Problems
            </Text>
          </View>

          <View className="items-center">
            {/* Speech-bubble tail: a small rotated square peeking out under the bubble */}
            <View
              className="items-center justify-center rounded-input bg-primary"
              style={{ width: 44, height: 36 }}
            >
              <Text style={{ fontSize: 16 }}>🖤</Text>
            </View>
            <View className="bg-primary" style={{ width: 10, height: 10, marginTop: -5, transform: [{ rotate: '45deg' }] }} />
            <Image
              source={require('../../../assets/characters/avatar-cat.png')}
              style={{ width: 140, height: 126, marginTop: 4 }}
              resizeMode="contain"
            />
          </View>

          <View className="items-center gap-4">
            <Text
              className="text-center text-3xl font-sans-bold text-text-primary"
              style={{ lineHeight: 36 }}
            >
              Every great app{'\n'}starts with a{' '}
              <Text className="text-primary">story.</Text>
            </Text>
            <View className="rounded-full bg-primary" style={{ width: 40, height: 3 }} />
            <Text className="text-center font-sans text-sm text-text-secondary">
              모든 앱에는{'\n'}시작이 되는 이야기가 있습니다.
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {LANGUAGES.map(({ lang, flag, label }) => (
            <LanguageRow key={lang} flag={flag} label={label} onPress={() => choose(lang)} />
          ))}
        </View>

        <View className="flex-row items-center justify-center gap-2">
          <Feather name="globe" size={14} color={COLORS.textSecondary} />
          <Text className="font-sans text-xs text-text-secondary">
            You can change your language anytime
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
