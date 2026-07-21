import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../services/supabase';

type AuthMode = 'sign-in' | 'sign-up';

// Lenient phone check — digits plus common separators, at least 7 chars.
// We only guard against obvious typos, not validate real numbers.
const PHONE_PATTERN = /^[0-9+\-\s()]{7,}$/;

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';
  const passwordsMatch = password === passwordConfirm;
  const phoneValid = PHONE_PATTERN.test(phone.trim());
  // Only surface these once the user has typed, so the form isn't red on open.
  const passwordMismatchError =
    isSignUp && passwordConfirm.length > 0 && !passwordsMatch
      ? "Passwords don't match.\n비밀번호가 일치하지 않아요."
      : undefined;
  const phoneError =
    isSignUp && phone.length > 0 && !phoneValid
      ? "That phone number doesn't look right.\n휴대전화 번호를 확인해주세요."
      : undefined;

  const canSubmit =
    email.length > 0 &&
    password.length > 0 &&
    (!isSignUp ||
      (name.length > 0 && passwordConfirm.length > 0 && passwordsMatch && phoneValid));

  const toggleMode = () => {
    setError(null);
    setMessage(null);
    setPasswordConfirm('');
    setPhone('');
    setMode(isSignUp ? 'sign-in' : 'sign-up');
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, phone: phone.trim() } },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage('Check your email to confirm your account.\n이메일을 확인해서 계정을 인증해주세요.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      if (code === 'invalid_credentials') {
        setError("That email or password doesn't look right.\n이메일 또는 비밀번호를 확인해주세요.");
      } else {
        setError('Something went wrong. Please try again.\n문제가 발생했어요. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-1 justify-center gap-6 px-6">
        <View className="items-center gap-1">
          <Text className="text-2xl font-sans-bold text-text-primary">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
          <Text className="text-sm text-text-secondary">
            {isSignUp ? '계정을 만들어주세요' : '다시 만나서 반가워요'}
          </Text>
        </View>

        <View className="gap-4">
          {isSignUp && <Input label="Name" placeholder="Your name" value={name} onChangeText={setName} />}
          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {isSignUp && (
            <Input
              label="Phone"
              placeholder="010-1234-5678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={phoneError}
            />
          )}
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
          {isSignUp && (
            <Input
              label="Confirm Password"
              placeholder="••••••••"
              secureTextEntry
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              error={passwordMismatchError}
            />
          )}
          {message && <Text className="text-xs text-text-secondary">{message}</Text>}
        </View>

        <Button
          label={isSignUp ? 'Sign Up' : 'Sign In'}
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />

        {!isSignUp && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Forgot password?"
            onPress={() => router.push('/forgot-password')}
          >
            <Text className="text-center text-sm text-text-secondary">
              Forgot password? · 비밀번호를 잊으셨나요?
            </Text>
          </Pressable>
        )}

        <Button
          label={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          variant="ghost"
          onPress={toggleMode}
        />
      </View>
    </SafeAreaView>
  );
}
