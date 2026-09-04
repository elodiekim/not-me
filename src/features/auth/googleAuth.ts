import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../services/supabase';

// Same deep-link pattern as password reset (see ForgotPasswordScreen): createURL
// resolves to the right scheme per environment automatically.
const GOOGLE_REDIRECT_TO = Linking.createURL('auth-callback');

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
      skipBrowserRedirect: true, // we drive the browser ourselves, see below
    },
  });
  if (error) throw error;
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

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}
