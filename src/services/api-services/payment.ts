import api from '../api-client';
import type { ApiResponse, CreatePaymentInput, CreatePaymentResult, Payment } from '../../types/api';

export const paymentsApi = {
  /**
   * POST /payments -- public. Opens a DOKU Virtual Account (or other
   * channel) for the PNR. The amount charged includes any unpaid
   * ancillary purchases made on this PNR at the time of the call, not
   * just the PNR's own total_amount (see CreatePaymentHandler's
   * pendingCharges dependency server-side) -- so the intended order is
   * booking -> ancillaries (optional) -> payment, not the other way.
   * Returns the VA number/expiry to pay against, not a status record --
   * poll getLatestPaymentByPnr for that.
   */
  async createPayment(payload: CreatePaymentInput): Promise<CreatePaymentResult | null> {
    const response = await api.post<ApiResponse<CreatePaymentResult>>('/payments', payload);
    return response.data.data;
  },

  /**
   * GET /payments/pnr/{pnr_id} -- public. Returns the most recent
   * payment attempt for a PNR (a PNR can have more than one, e.g. an
   * expired attempt followed by a retry). Poll this after createPayment
   * to reflect PENDING -> PAID once the DOKU webhook lands.
   */
  async getLatestPaymentByPnr(pnrId: number): Promise<Payment | null> {
    const response = await api.get<ApiResponse<Payment>>(`/payments/pnr/${pnrId}`);
    return response.data.data;
  },
};
