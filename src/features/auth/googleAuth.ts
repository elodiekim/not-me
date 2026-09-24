import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../services/supabase';

// Required on web for openAuthSessionAsync's popup to signal completion back
// to the window that opened it — a no-op on native. See AuthScreen's mount
// effect for the other half of the web path: it's a full-page redirect, not
// a popup, so it never goes through openAuthSessionAsync at all.
WebBrowser.maybeCompleteAuthSession();

// Same deep-link pattern as password reset (see ForgotPasswordScreen): createURL
// resolves to the right scheme per environment automatically. Native lands on
// the auth-callback fallback route (normally intercepted before the router
// ever sees it — see app/auth-callback.tsx); web has no such interception, so
// it's pointed straight at /sign-in, where AuthScreen itself picks the code
// off the URL on mount.
const GOOGLE_REDIRECT_TO = Linking.createURL(Platform.OS === 'web' ? 'sign-in' : 'auth-callback');

export class GoogleSignInCancelledError extends Error {}

/**
 * Google sign-in via Supabase's OAuth web flow, not the native Google Sign-In
 * SDK — that would need three separate client IDs (iOS/Android/Web) registered
 * in Google Cloud Console. This only needs one Web client ID registered on the
 * Supabase side; the trade-off is an in-app browser tab instead of a native
 * account picker sheet.
 *
 * This project uses PKCE (see services/supabase.ts's detectSessionInUrl: false),
 * so the callback arrives as ?code=... and gets exchanged the same way
 * ResetPasswordScreen already does — no new session-handling path.
 */
export async function signInWithGoogle(): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: GOOGLE_REDIRECT_TO,
      // Native: we drive the browser ourselves via openAuthSessionAsync below,
      // so it can capture the redirect directly instead of the OS routing it.
      // Web: there's no separate "app" to hand a URL back to — supabase-js
      // does a plain window.location redirect, and the tab reloads at
      // GOOGLE_REDIRECT_TO once Google finishes. Nothing left to do here.
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) throw error;
  if (Platform.OS === 'web') return;
  if (!data.url) throw new Error('No OAuth URL returned.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, GOOGLE_REDIRECT_TO);

  if (result.type !== 'success') {
    // User closed the browser or backed out — not an error to surface, just
    // means they changed their mind partway through.
    throw new GoogleSignInCancelledError();
  }

  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  if (!code) {
    throw new Error(url.searchParams.get('error_description') ?? 'No authorization code returned.');
  }

  await exchangeGoogleCode(code);
}

// Shared by the native path above and AuthScreen's mount effect (the web
// path: the code arrives as a query param on the page itself, not via a
// WebBrowser result).
export async function exchangeGoogleCode(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}
