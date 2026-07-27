import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, LoadingIndicator, RatingRow, SectionHeader } from '../../components/ui';
import { COLORS } from '../../constants/colors';
import { useReceivedReviews, useWrittenReviews, type Review } from '../../hooks/useReviews';
import { useAuthStore } from '../../stores/useAuthStore';

function formatReviewDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// relation 'by' = someone reviewed this hero; 'for' = I wrote this about a hero.
function ReviewCard({ review, relation }: { review: Review; relation: 'by' | 'for' }) {
  const attribution = `${relation === 'by' ? 'by' : 'for'} ${review.counterpartName}`;
  return (
    <Card>
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <RatingRow rating={review.rating} />
          <Text className="font-sans text-xs text-text-secondary">
            {formatReviewDate(review.createdAt)}
          </Text>
        </View>
        {review.comment ? (
          <Text className="font-sans text-sm text-text-primary">{review.comment}</Text>
        ) : null}
        <Text className="font-sans text-xs text-text-secondary">{attribution}</Text>
      </View>
    </Card>
  );
}

function EmptyReviews() {
  return (
    <View className="items-center gap-2 rounded-card bg-surface p-8">
      <Feather name="message-square" size={28} color={COLORS.textDisabled} />
      <Text className="font-sans text-center text-sm text-text-secondary">
        No reviews yet.{'\n'}아직 리뷰가 없어요.
      </Text>
    </View>
  );
}

export function ReviewsScreen() {
  const router = useRouter();
  const { heroId } = useLocalSearchParams<{ heroId?: string }>();
  const userId = useAuthStore((state) => state.session?.user.id);
  const isHeroView = !!heroId;

  // Hero view: only that hero's received reviews. Own view: my received + my written.
  const received = useReceivedReviews(heroId ?? userId);
  const written = useWrittenReviews(isHeroView ? undefined : userId);

  const isLoading = received.isLoading || written.isLoading;
  const isError = received.isError || written.isError;

  const header = (
    <View className="px-6 py-4">
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
        <Text className="ml-4 text-lg font-sans-semibold text-text-primary">Reviews</Text>
      </View>
      <Text className="ml-10 font-sans text-sm text-text-secondary">
        {isHeroView ? '받은 리뷰' : '내 리뷰'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <LoadingIndicator message="Loading reviews..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-sm text-text-secondary">
            Something went wrong.{'\n'}Please try again.
          </Text>
          <Button
            label="Try Again"
            variant="secondary"
            onPress={() => {
              received.refetch();
              written.refetch();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const receivedList = received.data ?? [];
  const writtenList = written.data ?? [];

  // Hero view: a single received-reviews list (read-only trust page).
  if (isHeroView) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        {receivedList.length === 0 ? (
          <View className="flex-1 justify-center px-6">
            <EmptyReviews />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
            {receivedList.map((review) => (
              <ReviewCard key={review.id} review={review} relation="by" />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // Own view: received + written sections. Totally empty → one centered empty state.
  if (receivedList.length === 0 && writtenList.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {header}
        <View className="flex-1 justify-center px-6">
          <EmptyReviews />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {header}
      <ScrollView contentContainerStyle={{ padding: 24, gap: 32 }}>
        <View className="gap-3">
          <SectionHeader title="Received · 받은 리뷰" />
          {receivedList.length === 0 ? (
            <View className="items-center gap-2 rounded-card bg-surface p-8">
              <Text className="font-sans text-sm text-text-secondary">
                No reviews yet · 받은 리뷰가 없어요
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {receivedList.map((review) => (
                <ReviewCard key={review.id} review={review} relation="by" />
              ))}
            </View>
          )}
        </View>

        <View className="gap-3">
          <SectionHeader title="Written · 남긴 리뷰" />
          {writtenList.length === 0 ? (
            <View className="items-center gap-2 rounded-card bg-surface p-8">
              <Text className="font-sans text-sm text-text-secondary">
                No reviews yet · 남긴 리뷰가 없어요
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {writtenList.map((review) => (
                <ReviewCard key={review.id} review={review} relation="for" />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
