import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, LoadingIndicator } from '../../components/ui';
import { useMission } from '../../hooks/useMission';
import { useSubmitReview } from '../../hooks/useSubmitReview';
import { StarRating } from './components/StarRating';

export function CompleteScreen() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams<{ missionId?: string }>();
  const { data: mission, isLoading } = useMission(missionId);
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Direct/repeat entry to an already-reviewed mission (e.g. a stale link or
  // back-navigation) would otherwise show the form again and hit the DB's
  // one-review-per-mission constraint on submit, stuck behind a generic error.
  useEffect(() => {
    if (mission?.hasReview) {
      router.replace('/');
    }
  }, [mission, router]);

  if (isLoading || mission?.hasReview) {
    return <LoadingIndicator message="Loading mission..." />;
  }

  const handleSubmit = async () => {
    if (!mission?.heroId) return;
    setError(null);

    try {
      await submitReview.mutateAsync({
        missionId: mission.id,
        heroId: mission.heroId,
        rating,
        comment,
      });
      router.replace('/');
    } catch {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Pressable className="flex-1" onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 gap-8 px-6 pt-8">
          <View className="items-center gap-3">
            <Image
              source={require('../../../assets/characters/proud-cat.png')}
              style={{ width: 140, height: 140 }}
              resizeMode="contain"
            />
            <Text className="text-2xl font-sans-bold text-text-primary">Mission Complete!</Text>
            <Text className="font-sans text-center text-sm text-text-secondary">
              바퀴벌레 문제 해결 완료!{'\n'}Thanks for using NotMe.
            </Text>
          </View>

          <View className="gap-4">
            <Text className="text-center text-base font-sans-semibold text-text-primary">
              How was your Hero?
            </Text>
            <StarRating rating={rating} onChange={setRating} />
            <Input
              placeholder="Leave a comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            {error && <Text className="text-center text-sm text-danger">{error}</Text>}
          </View>
        </View>

        <View className="px-6 pb-6">
          <Button
            label="Submit Review"
            variant="primary"
            loading={submitReview.isPending}
            disabled={rating === 0 || submitReview.isPending || !mission?.heroId}
            onPress={handleSubmit}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
