import '../src/styles/global.css';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Stack, useGlobalSearchParams, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useProfile } from '../src/hooks/useProfile';
import { supabase } from '../src/services/supabase';
import { useAuthStore } from '../src/stores/useAuthStore';
import { useOnboardingStore } from '../src/stores/useOnboardingStore';

// Keep the native splash up until fonts and the onboarding flag have loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function AuthGate({ children }: { children: ReactNode }) {
  const { session, initializing } = useAuthStore();
  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const segments = useSegments();
  // The portfolio's demo link is ?demo=1 on /sign-in, but a first-time visitor
  // gets bounced through /onboarding first — a plain string Redirect href
  // drops every query param, so without reattaching it here (and again in
  // OnboardingScreen's own finish-onboarding redirect) the demo prefill never
  // survives to the sign-in screen it was meant for. useGlobalSearchParams,
  // not useLocalSearchParams: this runs above the Stack, outside any one
  // screen's own route.
  const { demo } = useGlobalSearchParams<{ demo?: string }>();
  const onboardingHref = demo
    ? { pathname: '/onboarding' as const, params: { demo } }
    : '/onboarding';
  const signInHref = demo ? { pathname: '/sign-in' as const, params: { demo } } : '/sign-in';
  // Deliberately global, not just on Settings' delete-account flow: an admin can
  // disable someone from notme-admin at any time, not only in response to that
  // user's own action, so this has to catch it wherever they happen to be.
  const { data: profile } = useProfile();
  const isDeactivated = !!session && profile?.isActive === false;

  // Soft-deleting/disabling a profile (0019) doesn't revoke the Supabase Auth
  // session by itself — this is what actually signs them out, the moment the
  // profile fetch confirms is_active is false.
  useEffect(() => {
    if (isDeactivated) {
      supabase.auth.signOut();
    }
  }, [isDeactivated]);

  if (initializing) {
    return null;
  }

  const inOnboarding = segments[0] === 'onboarding';
  const inAuthScreen = segments[0] === 'sign-in';
  // Password-reset routes must be reachable without a session — including via a deep
  // link that lands before onboarding — so the recovery link never gets bounced away.
  const inPasswordReset = segments[0] === 'forgot-password' || segments[0] === 'reset-password';
  const inAccountDeleted = segments[0] === 'account-deleted';

  // Checked before every other rule: a deactivated account shouldn't land on
  // onboarding or the normal sign-in bounce, just this one explanation screen.
  if (isDeactivated && !inAccountDeleted) {
    return <Redirect href="/account-deleted" />;
  }

  // First-time, logged-out users see onboarding before anything else — even on deep links.
  if (!hasOnboarded && !session) {
    if (inOnboarding || inPasswordReset) {
      return children;
    }
    return <Redirect href={onboardingHref} />;
  }

  // Onboarded or logged-in users should never land on the onboarding route.
  if (inOnboarding) {
    return <Redirect href={session ? '/' : signInHref} />;
  }

  if (!session && !inAuthScreen && !inPasswordReset && !inAccountDeleted) {
    return <Redirect href={signInHref} />;
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
