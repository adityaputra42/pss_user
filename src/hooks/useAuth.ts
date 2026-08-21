import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, LoginResult } from '../types/api';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: AuthUser | null;

  isAuthenticated: () => boolean;
  setSession: (result: LoginResult) => void;
  logout: () => void;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: AuthUser | null;

  isAuthenticated: () => boolean;
  setSession: (result: LoginResult) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,

      isAuthenticated: () => !!get().accessToken && !!get().user,

      setSession: (result) =>
        set({
          accessToken: result.access_token,
          refreshToken: result.refresh_token,
          expiresAt: result.expires_at,
          user: result.user,
        }),

      logout: () => set({ accessToken: null, refreshToken: null, expiresAt: null, user: null }),
    }),
    {
      name: 'Aira Fly-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
