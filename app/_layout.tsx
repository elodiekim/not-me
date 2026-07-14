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
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useOnboardingStore } from '../src/stores/useOnboardingStore';

// Keep the native splash up until fonts and the onboarding flag have loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuthStore();
  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const segments = useSegments();

  if (initializing) {
    return null;
  }

  const inOnboarding = segments[0] === 'onboarding';
  const inAuthScreen = segments[0] === 'sign-in';

  // First-time, logged-out users see onboarding before anything else — even on deep links.
  if (!hasOnboarded && !session) {
    return inOnboarding ? children : <Redirect href="/onboarding" />;
  }

  // Onboarded or logged-in users should never land on the onboarding route.
  if (inOnboarding) {
    return <Redirect href={session ? '/' : '/sign-in'} />;
  }

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
  const onboardingLoading = useOnboardingStore((state) => state.loading);
  const ready = fontsLoaded && !onboardingLoading;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
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
