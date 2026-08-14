import api from '../api-client';
import type { ApiResponse, CreateBookingInput, PNR } from '../../types/api';

export const bookingsApi = {
  /**
   * POST /bookings/pnrs -- public, no auth required. This is the one
   * booking endpoint a guest can call; GET /bookings/pnrs/{id} and
   * list/cancel are all BearerAuth-only (agent/admin side), so once
   * created there is no way to look a booking back up through this API
   * without logging in. The response here (PNRID, BookingCode, Status,
   * ExpiresAt, TotalAmount, Currency) is the only data guests get back
   * -- it deliberately does not echo passenger/segment IDs, so hang on
   * to it client-side for the rest of the flow (payment, ancillaries,
   * the confirmation screen).
   */
  async createBooking(payload: CreateBookingInput): Promise<PNR | null> {
    const response = await api.post<ApiResponse<PNR>>('/bookings/pnrs', payload);
    return response.data.data;
  },
};
