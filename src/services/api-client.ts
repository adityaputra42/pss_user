import axios from 'axios';

/**
 * This is the public-facing booking site's API client. Unlike the admin
 * panel, almost every endpoint it calls is intentionally public
 * (no BearerAuth) -- flight search, PNR creation, payment creation, and
 * ancillary purchase all work without a token (verified against
 * docs/swagger.json: those routes carry no `security` block server-side).
 *
 * There's no login flow here, so there's no refresh-token interceptor
 * either. If a token happens to be sitting in storage (e.g. a shared
 * browser where someone also uses the admin/agent side), it's attached
 * opportunistically -- but the whole guest flow, search through payment,
 * must keep working with none at all.
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
  const token = localStorage.getItem('guest_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
