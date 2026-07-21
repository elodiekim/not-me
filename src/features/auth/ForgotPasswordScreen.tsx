import { Feather } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../services/supabase';

// The deep link Supabase sends the user back to, handled by app/reset-password.tsx.
// createURL resolves to the right scheme per environment — exp://…/--/reset-password
// inside Expo Go, notme://reset-password in a dev/standalone build.
const RESET_REDIRECT_TO = Linking.createURL('reset-password');

export function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: RESET_REDIRECT_TO,
      });

      // Only a genuine network/transport failure is worth surfacing. For anything else —
      // including a non-existent email — Supabase's default keeps quiet, and so do we,
      // so we never reveal whether an account exists for a given email.
      if (resetError && resetError.name === 'AuthRetryableFetchError') {
        setError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center px-6 py-4">
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111111" />
        </Pressable>
      </View>

      <View className="flex-1 justify-center gap-6 px-6">
        <View className="items-center gap-1">
          <Text className="text-2xl font-sans-bold text-text-primary">Reset your password</Text>
          <Text className="text-sm text-text-secondary">비밀번호를 재설정해요</Text>
        </View>

        {sent ? (
          <Text className="text-center text-sm text-text-secondary">
            If an account exists, we've sent a reset link.{'\n'}계정이 있다면 재설정 링크를 보내드렸어요.
          </Text>
        ) : (
          <>
            <Input
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={error ?? undefined}
            />
            <Button
              label="Send Reset Link"
              variant="primary"
              loading={loading}
              disabled={email.trim().length === 0}
              onPress={handleSubmit}
            />
          </>
        )}

        <Button label="Back to Sign In" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}
