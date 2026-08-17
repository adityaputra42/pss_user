import api from '../api-client';
import type { ApiResponse, LoginInput, LoginResult } from '../../types/api';

export const authApi = {
  /**
   * POST /auth/login -- public. Login is entirely optional on this
   * site: the booking flow (POST /bookings/pnrs) works with or without
   * a token via OptionalAuthenticate. The only difference logging in
   * makes today is that the resulting PNR's `created_by` gets tagged
   * with this user's id server-side -- there is no "my bookings"
   * endpoint yet to read that history back.
   */
  async login(payload: LoginInput): Promise<LoginResult | null> {
    const response = await api.post<ApiResponse<LoginResult>>('/auth/login', payload);
    return response.data.data;
  },

  /** POST /auth/refresh-token -- public. Exchanges a refresh token for a new pair. */
  async refresh(refreshToken: string): Promise<LoginResult | null> {
    const response = await api.post<ApiResponse<LoginResult>>('/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data.data;
  },
};
