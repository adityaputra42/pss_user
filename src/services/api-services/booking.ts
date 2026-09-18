import api from '../api-client';
import type { ApiResponse, CreateBookingInput, ListPNRsQuery, ListPNRsResult, PNRDetail } from '../../types/api';

export const bookingsApi = {
  /** POST /bookings/pnrs. Returns the full PNRDetail (contact, passengers,
   * segments, seats, ancillaries) -- not the old lightweight PNR summary --
   * so the frontend doesn't need a second round trip right after booking. */
  async createBooking(payload: CreateBookingInput): Promise<PNRDetail | null> {
    const response = await api.post<ApiResponse<PNRDetail>>('/bookings/pnrs', payload);
    return response.data.data;
  },

  async listMine(query: ListPNRsQuery = {}): Promise<ListPNRsResult | null> {
    const { page = 1, limit = 10, status } = query;
    const response = await api.get<ApiResponse<ListPNRsResult>>('/bookings/pnrs/mine', {
      params: { page, limit, status: status || undefined },
    });
    return response.data.data;
  },
};

