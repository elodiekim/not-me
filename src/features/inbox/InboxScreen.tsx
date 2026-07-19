import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ComingSoonScreen, LoadingIndicator } from '../../components/ui';
import { useMissionHistory } from '../../hooks/useMissionHistory';
import { deriveActivityEvents } from './deriveActivityEvents';

// Relative time without a date library (new deps are off-limits). Falls back to
// an absolute date once an event is more than a week old.
function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function InboxHeader() {
  return (
    <View className="px-6 py-4">
      <Text className="text-lg font-sans-semibold text-text-primary">Inbox</Text>
      <Text className="font-sans text-sm text-text-secondary">받은편지함</Text>
    </View>
  );
}

export function InboxScreen() {
  const router = useRouter();
  const { data: missions, isLoading, isError, refetch } = useMissionHistory();

  const events = useMemo(() => deriveActivityEvents(missions ?? []), [missions]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <InboxHeader />
        <LoadingIndicator message="Loading activity..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-background px-6" edges={['top']}>
        <Text className="text-center text-sm text-text-secondary">
          Something went wrong.{'\n'}Please try again.
        </Text>
        <Button label="Try Again" variant="secondary" onPress={() => refetch()} />
      </SafeAreaView>
    );
  }

  // No activity yet → keep the friendly empty state Inbox has always shown.
  if (events.length === 0) {
    return (
      <ComingSoonScreen
        icon="inbox"
        title="Inbox"
        koTitle="받은편지함"
        description={'Updates about your missions\nwill show up here.'}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <InboxHeader />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        {events.map((event) => {
          const row = (
            <View className="gap-1 rounded-card bg-surface p-4">
              <Text className="text-sm font-sans-semibold text-text-primary">{event.message}</Text>
              <Text className="font-sans text-xs text-text-secondary">{formatRelativeTime(event.timestamp)}</Text>
            </View>
          );
          return event.route ? (
            <Pressable
              key={event.id}
              accessibilityRole="button"
              accessibilityLabel={event.message}
              onPress={() => router.push(event.route as never)}
            >
              {row}
            </Pressable>
          ) : (
            <View key={event.id}>{row}</View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
