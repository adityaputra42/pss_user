import api from '../api-client';
import type {
  ApiResponse,
  AncillaryPurchase,
  CatalogItem,
  PurchaseAncillaryInput,
} from '../../types/api';

interface AncillaryListResponse<T> {
  items: T[];
  total: number;
}

export const ancillariesApi = {
  /** GET /ancillaries -- public catalog (with current price, if any is configured). */
  async getCatalog(): Promise<CatalogItem[]> {
    const response = await api.get<ApiResponse<AncillaryListResponse<CatalogItem>>>('/ancillaries', {
      params: { limit: 100, is_active: true },
    });
    return response.data.data?.items ?? [];
  },

  /**
   * POST /ancillaries/purchases -- public. passenger_id/segment_id/
   * flight_id are all optional server-side; guests can't know their
   * PNR's internal passenger/segment IDs anyway (createBooking doesn't
   * return them and PNR detail is auth-only), so this books ancillaries
   * at the PNR level rather than tied to one passenger or leg. Does NOT
   * charge immediately -- it's picked up by the next POST /payments call.
   */
  async purchase(payload: PurchaseAncillaryInput): Promise<AncillaryPurchase | null> {
    const response = await api.post<ApiResponse<AncillaryPurchase>>('/ancillaries/purchases', payload);
    return response.data.data;
  },
};
