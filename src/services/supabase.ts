import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and fill in your project URL and anon key.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ResetPasswordScreen's comment claimed this project was already on the
    // PKCE flow, but @supabase/auth-js actually defaults to 'implicit' and
    // this was never set — password recovery happened to work anyway
    // (GoTrue always issues a redeemable code for recovery links regardless
    // of flowType), which hid the gap until Google sign-in exposed it:
    // signInWithOAuth had nothing to send as code_challenge, so GoTrue
    // returned an access_token URL fragment instead of ?code=, which this
    // app never reads (detectSessionInUrl: false below) — the sign-in screen
    // just sat there with no error and no session. Confirmed via Playwright:
    // the /authorize request had no code_challenge param at all before this.
    flowType: 'pkce',
    // Explicit PKCE (above) means signInWithOAuth's web path now genuinely
    // does write a code_verifier to storage and immediately hard-navigates
    // to Google in the same tick (see googleAuth.ts). AsyncStorage's web
    // backend is a Promise-based wrapper around its own store, not a direct
    // window.localStorage passthrough — window.localStorage's API is fully
    // synchronous, so only it is guaranteed not to lose that write to the
    // navigation. Native is untouched — AsyncStorage there is the real
    // native module, not this web shim.
    storage: Platform.OS === 'web' ? window.localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
