import api from '../api-client';
import type { ApiResponse, CreateBookingInput, ListPNRsQuery, ListPNRsResult, PNR } from '../../types/api';

export const bookingsApi = {
  async createBooking(payload: CreateBookingInput): Promise<PNR | null> {
    const response = await api.post<ApiResponse<PNR>>('/bookings/pnrs', payload);
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

