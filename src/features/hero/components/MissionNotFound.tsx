import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../components/ui';

interface MissionNotFoundProps {
  onRetry?: () => void;
}

// Supabase's .single() throws the same error whether the mission genuinely
// doesn't exist or the request just failed, so this covers both honestly
// instead of guessing which one happened.
export function MissionNotFound({ onRetry }: MissionNotFoundProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-6">
      <Text className="text-center font-sans text-sm text-text-secondary">
        We couldn't load this mission.{'\n'}미션을 불러올 수 없어요.
      </Text>
      {onRetry && <Button label="Try Again" variant="secondary" onPress={onRetry} />}
    </SafeAreaView>
  );
}
