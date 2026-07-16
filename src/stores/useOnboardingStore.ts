import { create } from 'zustand';
import {
  clearHasOnboarded,
  getHasOnboarded,
  setHasOnboarded,
} from '../features/onboarding/onboardingStorage';

interface OnboardingState {
  hasOnboarded: boolean;
  loading: boolean;
  // Persist the flag and flip it in memory so the gate stops redirecting to onboarding.
  complete: () => Promise<void>;
  // Dev-only: clear the flag so the onboarding flow can be seen again.
  reset: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasOnboarded: false,
  loading: true,
  complete: async () => {
    await setHasOnboarded();
    set({ hasOnboarded: true });
  },
  reset: async () => {
    await clearHasOnboarded();
    set({ hasOnboarded: false });
  },
}));

getHasOnboarded().then((value) => {
  useOnboardingStore.setState({ hasOnboarded: value, loading: false });
});
