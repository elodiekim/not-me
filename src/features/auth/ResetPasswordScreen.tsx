import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, LoadingIndicator } from '../../components/ui';
import { supabase } from '../../services/supabase';

// exchanging: trading the recovery code for a session.
// ready: valid session established, show the new-password form.
// invalid: no code, or the code was expired / already used / malformed.
type Status = 'exchanging' | 'ready' | 'invalid';

export function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const [status, setStatus] = useState<Status>('exchanging');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This project uses the PKCE flow (see services/supabase.ts), so the recovery
  // email arrives as ?code=...&type=recovery and we swap the code for a session here.
  useEffect(() => {
    let cancelled = false;

    if (!code) {
      setStatus('invalid');
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (cancelled) return;
        setStatus(exchangeError ? 'invalid' : 'ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('invalid');
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  const passwordsMatch = password === passwordConfirm;
  const passwordMismatchError =
    passwordConfirm.length > 0 && !passwordsMatch
      ? "Passwords don't match.\n비밀번호가 일치하지 않아요."
      : undefined;
  const canSubmit = password.length > 0 && passwordConfirm.length > 0 && passwordsMatch;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // The exchange already left us with a valid session, so we can go straight home.
      router.replace('/');
    } catch {
      setError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'exchanging') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background" edges={['top']}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (status === 'invalid') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-1 justify-center gap-6 px-6">
          <View className="items-center gap-1">
            <Text className="text-2xl font-sans-bold text-text-primary">Link expired</Text>
            <Text className="text-center text-sm text-text-secondary">
              This reset link is invalid or expired.{'\n'}링크가 만료되었거나 잘못됐어요.
            </Text>
          </View>
          <Button
            label="Back to Sign In"
            variant="primary"
            onPress={() => router.replace('/sign-in')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="items-center gap-1">
          <Text className="text-2xl font-sans-bold text-text-primary">Set a new password</Text>
          <Text className="text-sm text-text-secondary">새 비밀번호를 설정해요</Text>
        </View>

        <View className="gap-4">
          <Input
            label="New Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
          <Input
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            error={passwordMismatchError}
          />
        </View>

        <Button
          label="Update Password"
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}
