import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

/** Redirect URI sent to Supabase — must match dashboard Redirect URLs. */
export function getAuthRedirectUri(): string {
  return makeRedirectUri({ scheme: 'family', path: '/' });
}

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;
  if (!access_token) return null;
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.history.replaceState(null, '', window.location.pathname);
  }
  return data.session;
}

function consumeWebAuthHash() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const { hash, href } = window.location;
  if (!hash || !hash.includes('access_token')) return;
  createSessionFromUrl(href).catch(console.error);
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    consumeWebAuthHash();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    Linking.getInitialURL().then((url) => {
      if (url) createSessionFromUrl(url).catch(console.error);
    });
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      createSessionFromUrl(url).catch(console.error);
    });

    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const redirectTo = getAuthRedirectUri();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signInWithEmail,
      signOut,
    }),
    [session, loading, signInWithEmail, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
