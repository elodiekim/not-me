import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { supabase } from '../../services/supabase';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';
  const canSubmit = email.length > 0 && password.length > 0 && (!isSignUp || name.length > 0);

  const toggleMode = () => {
    setError(null);
    setMessage(null);
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
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;

        if (!data.session) {
          setMessage('Check your email to confirm your account.\n이메일을 확인해서 계정을 인증해주세요.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
          {message && <Text className="text-xs text-text-secondary">{message}</Text>}
        </View>

        <Button
          label={isSignUp ? 'Sign Up' : 'Sign In'}
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />

        <Button
          label={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          variant="ghost"
          onPress={toggleMode}
        />
      </View>
    </SafeAreaView>
  );
}
