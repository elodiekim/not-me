import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Keyboard, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { StarRating } from './components/StarRating';

export function CompleteScreen() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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
          </View>
        </View>

        <View className="px-6 pb-6">
          <Button
            label="Submit Review"
            variant="primary"
            disabled={rating === 0}
            onPress={() => router.replace('/')}
          />
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
