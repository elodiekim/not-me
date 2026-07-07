import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface AuthState {
  session: Session | null;
  initializing: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initializing: true,
  setSession: (session) => set({ session, initializing: false }),
}));

supabase.auth.getSession().then(({ data }) => {
  useAuthStore.getState().setSession(data.session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
