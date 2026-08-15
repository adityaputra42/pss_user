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
  /**
   * GET /ancillaries -- public, global catalog. NOTE: as of the flight
   * whitelist, this is NOT what's actually purchasable for any given
   * flight -- an ancillary can be listed here and still be rejected at
   * purchase time if it has no inventory row for the flight. Use
   * getFlightCatalog for anything the guest can actually buy.
   */
  async getCatalog(): Promise<CatalogItem[]> {
    const response = await api.get<ApiResponse<AncillaryListResponse<CatalogItem>>>('/ancillaries', {
      params: { limit: 100, is_active: true },
    });
    return response.data.data?.items ?? [];
  },

  /**
   * GET /ancillaries/flight/{flight_id} -- public. The real, purchasable
   * catalog for one flight: only ancillaries an admin has explicitly
   * whitelisted for it (see pss_admin's "Manage Ancillaries"), each with
   * AvailableQuantity. Empty result is normal -- it means nothing has
   * been whitelisted for that flight yet, not an error.
   */
  async getFlightCatalog(flightId: number): Promise<CatalogItem[]> {
    const response = await api.get<ApiResponse<CatalogItem[]>>(`/ancillaries/flight/${flightId}`);
    return response.data.data ?? [];
  },

  /**
   * POST /ancillaries/purchases -- public. passenger_id/segment_id are
   * still omitted here (guests can't know their PNR's internal
   * passenger/segment IDs -- createBooking doesn't return them and PNR
   * detail is auth-only), but flight_id is now REQUIRED in practice:
   * omitting it skips the whitelist check server-side entirely, which
   * would silently let a guest buy something never configured for
   * their flight. Does NOT charge immediately -- picked up by the next
   * POST /payments call.
   */
  async purchase(payload: PurchaseAncillaryInput): Promise<AncillaryPurchase | null> {
    const response = await api.post<ApiResponse<AncillaryPurchase>>('/ancillaries/purchases', payload);
    return response.data.data;
  },
};
