import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getItem, removeItem, setItem, storageKeys } from '@/lib/storage';
import { supabase } from '@/lib/supabase/client';

/** Стан входу (сесія Supabase) та онбордингу. */
type SessionContextValue = {
  ready: boolean;
  onboarded: boolean;
  session: Session | null;
  signedIn: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getItem(storageKeys.onboarded).then((stored) => {
      setOnboarded(stored === 'true');
      setOnboardingLoaded(true);
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setSessionLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const value: SessionContextValue = {
    ready: onboardingLoaded && sessionLoaded,
    onboarded,
    session,
    signedIn: session !== null,
    completeOnboarding: () => {
      setOnboarded(true);
      setItem(storageKeys.onboarded, 'true');
    },
    resetOnboarding: () => {
      setOnboarded(false);
      removeItem(storageKeys.onboarded);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
