'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import type { AppUser } from '@/types/user.types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(
    pb.authStore.record as AppUser | null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync the PocketBase auth cookie whenever auth state changes.
  // Middleware reads this cookie to protect routes server-side.
  const syncCookie = useCallback(() => {
    document.cookie = pb.authStore.exportToCookie({ httpOnly: false, secure: false });
  }, []);

  useEffect(() => {
    const unsub = pb.authStore.onChange(() => {
      setUser(pb.authStore.record as AppUser | null);
      syncCookie();
    });
    syncCookie();
    return unsub;
  }, [syncCookie]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      await pb.collection('users').create({
        email,
        username,
        password,
        passwordConfirm: password,
      });
      await pb.collection('users').authWithPassword(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    pb.authStore.clear();
    syncCookie();
    router.push('/');
  }, [syncCookie, router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
