import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { getItem, removeItem, setItem, storageKeys } from '@/lib/storage';

/**
 * Стан входу й онбордингу.
 *
 * TODO(Етап 1, Supabase): замінити тестовий вхід на supabase.auth
 * (Google / Apple) і брати `signedIn` з поточної сесії.
 */
type SessionContextValue = {
  ready: boolean;
  onboarded: boolean;
  signedIn: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  signInDev: (provider: 'google' | 'apple') => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    Promise.all([getItem(storageKeys.onboarded), getItem(storageKeys.devSession)]).then(
      ([storedOnboarded, storedSession]) => {
        setOnboarded(storedOnboarded === 'true');
        setSignedIn(storedSession !== null);
        setReady(true);
      },
    );
  }, []);

  const value: SessionContextValue = {
    ready,
    onboarded,
    signedIn,
    completeOnboarding: () => {
      setOnboarded(true);
      setItem(storageKeys.onboarded, 'true');
    },
    resetOnboarding: () => {
      setOnboarded(false);
      removeItem(storageKeys.onboarded);
    },
    signInDev: (provider) => {
      setSignedIn(true);
      setItem(storageKeys.devSession, provider);
    },
    signOut: () => {
      setSignedIn(false);
      removeItem(storageKeys.devSession);
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
