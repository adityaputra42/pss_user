import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { authApi } from './api-services/auth';

/**
 * This is the public-facing booking site's API client. Unlike the admin
 * panel, almost every endpoint it calls is intentionally public
 * (no BearerAuth) -- flight search, PNR creation, payment creation, and
 * ancillary purchase all work without a token (verified against
 * docs/swagger.json: those routes carry no `security` block server-side).
 *
 * Login IS supported and optional (see hooks/useAuth.ts): if a session
 * exists, its access token is attached opportunistically on every
 * request. POST /bookings/pnrs is OptionalAuthenticate server-side, so
 * a logged-in guest's booking gets tagged with their user id; a
 * logged-out guest's request goes through exactly the same either way.
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// One-shot refresh-and-retry on 401. If the refresh token is also dead,
// log out quietly and let the original request fail as a guest would --
// login being optional means an expired session must never block the
// booking flow, only fall back to it.
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { refreshToken, logout, setSession } = useAuth.getState();

    if (error.response?.status !== 401 || !refreshToken || original?._retried) {
      return Promise.reject(error);
    }
    original._retried = true;

    try {
      refreshing =
        refreshing ??
        authApi.refresh(refreshToken).then((result) => {
          if (result) {
            setSession(result);
            return result.access_token;
          }
          logout();
          return null;
        });

      const newToken = await refreshing;
      refreshing = null;

      if (!newToken) {
        return Promise.reject(error);
      }

      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch {
      refreshing = null;
      logout();
      return Promise.reject(error);
    }
  },
);

export default api;
