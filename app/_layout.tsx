import '../src/styles/global.css';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';

const queryClient = new QueryClient();

function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuthStore();
  const segments = useSegments();

  if (initializing) {
    return null;
  }

  const inAuthScreen = segments[0] === 'sign-in';

  if (!session && !inAuthScreen) {
    return <Redirect href="/sign-in" />;
  }

  if (session && inAuthScreen) {
    return <Redirect href="/" />;
  }

  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
