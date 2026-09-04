import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Normally never rendered: WebBrowser.openAuthSessionAsync (see
// features/auth/googleAuth.ts) intercepts the notme://auth-callback redirect
// itself and resolves in place, without the OS ever handing it to the router.
// This exists only as a fallback in case that interception doesn't happen on
// some platform/OS combination — bounces Home rather than showing an
// "Unmatched Route" screen for a URL nothing else claims.
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
