import api from '../api-client';
import type {
  ApiResponse,
  TopupInput,
  TopupResult,
  TopupStatus,
  WalletBalance,
  WalletTransactionsResult,
} from '../../types/api';

/**
 * All four endpoints require login (RequireAuthenticated server-side) --
 * there is no guest wallet, a wallet always belongs to exactly one
 * authenticated user. Callers must check useAuth's isAuthenticated()
 * before rendering anything that hits this service; api-client's
 * request interceptor will attach whatever token exists, but if there
 * isn't one these calls come back 401.
 */
export const walletApi = {
  /** GET /wallet/balance -- always the caller's own wallet. */
  async getBalance(): Promise<WalletBalance | null> {
    const response = await api.get<ApiResponse<WalletBalance>>('/wallet/balance');
    return response.data.data;
  },

  /** GET /wallet/transactions -- paginated ledger, newest first. */
  async listTransactions(page = 1, limit = 10): Promise<WalletTransactionsResult | null> {
    const response = await api.get<ApiResponse<WalletTransactionsResult>>('/wallet/transactions', {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * POST /wallet/topup -- opens a DOKU Virtual Account the same way
   * paymentsApi.createPayment does. The balance is only credited once
   * DOKU's notification lands, NOT immediately -- poll getTopupStatus
   * after this the same way ConfirmationPage polls a payment.
   */
  async topup(payload: TopupInput): Promise<TopupResult | null> {
    const response = await api.post<ApiResponse<TopupResult>>('/wallet/topup', payload);
    return response.data.data;
  },

  /** GET /wallet/topup/{code} -- poll this while waiting for a topup to settle. */
  async getTopupStatus(code: string): Promise<TopupStatus | null> {
    const response = await api.get<ApiResponse<TopupStatus>>(`/wallet/topup/${code}`);
    return response.data.data;
  },
};
