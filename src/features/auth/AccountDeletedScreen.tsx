import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';

// AuthGate signs the user out the moment it sees is_active = false, then lands
// them here instead of silently on Sign In — otherwise a deleted account just
// looks like an unexplained logout.
export function AccountDeletedScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-3 px-6">
        <Text className="text-center text-2xl font-sans-bold text-text-primary">
          Your account has been deleted
        </Text>
        <Text className="text-center font-sans text-sm text-text-secondary">
          계정이 삭제됐어요.{'\n'}This account can no longer be signed into.
        </Text>
      </View>
      <View className="px-6 pb-6">
        <Button
          label="Back to Sign In"
          variant="secondary"
          onPress={() => router.replace('/sign-in')}
        />
      </View>
    </SafeAreaView>
  );
}
