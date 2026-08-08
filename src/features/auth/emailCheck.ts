import { supabase } from '../../services/supabase';

export const EMAIL_TAKEN_ERROR =
  'This email is already registered. Try signing in instead.\n이미 가입된 이메일이에요. 로그인해주세요.';

// Rough enough to skip pointless round trips while someone is still typing —
// real validation is the server's job, not a regex's.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function looksLikeEmail(email: string): boolean {
  return LOOKS_LIKE_EMAIL.test(email.trim());
}

/**
 * Whether this address already has an account (see 0014_email_is_registered.sql).
 *
 * Returns false when the lookup itself fails: this only decides whether to warn
 * early, and signUp still catches a duplicate on submit. Blocking sign-up because
 * a convenience check couldn't reach the server would be the worse failure.
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('email_is_registered', {
    check_email: email.trim(),
  });

  if (error) return false;
  return data === true;
}
