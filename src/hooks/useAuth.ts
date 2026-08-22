import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, LoginResult } from '../types/api';

/**
 * Login is optional site-wide -- this store just holds whatever session
 * exists, if any. Nothing here gates the booking flow: SearchForm,
 * ResultsPage, BookingPage and ConfirmationPage all work identically
 * whether isAuthenticated is true or false. The one thing being logged
 * in changes is that api-client's request interceptor finds a token
 * here and attaches it, which tags the resulting PNR's `created_by` on
 * the backend (POST /bookings/pnrs uses OptionalAuthenticate).
 *
 * Persisted to localStorage (not sessionStorage, unlike useBookingFlow)
 * because a login should survive closing the tab -- that's the whole
 * point of it existing separately from the guest booking flow.
 *
 * Storage key 'guest_access_token' matches what api-client.ts's request
 * interceptor already reads.
 */

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: AuthUser | null;

  isAuthenticated: () => boolean;
  setSession: (result: LoginResult) => void;
  logout: () => void;
}

/**
 * Login is optional site-wide -- this store just holds whatever session
 * exists, if any. Nothing here gates the booking flow: SearchForm,
 * ResultsPage, BookingPage and ConfirmationPage all work identically
 * whether isAuthenticated is true or false. The one thing being logged
 * in changes is that api-client's request interceptor reads the token
 * from this store and attaches it, which tags the resulting PNR's
 * `created_by` on the backend (POST /bookings/pnrs uses
 * OptionalAuthenticate).
 *
 * Persisted to localStorage (not sessionStorage, unlike useBookingFlow)
 * because a login should survive closing the tab -- that's the whole
 * point of it existing separately from the guest booking flow.
 */

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
