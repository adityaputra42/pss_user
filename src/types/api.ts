// ======================================================
// GENERIC API
// ======================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ListResponse<T> {
  Items: T[];
  Total: number;
}

// ======================================================
// AUTH (optional login -- see services/api-services/auth.ts)
// ======================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role_id: number;
  status: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: AuthUser;
}


// ======================================================
// PASSENGER TYPE (shared: fares, passengers, bookings)
// ======================================================

/** ADT = adult, CHD = child, INF = infant (no seat, travels on an adult's lap). */
export type PassengerType = 'ADT' | 'CHD' | 'INF';

export const PASSENGER_TYPES: PassengerType[] = ['ADT', 'CHD', 'INF'];

export const PASSENGER_TYPE_LABELS: Record<PassengerType, string> = {
  ADT: 'Adult (12+ yrs)',
  CHD: 'Child (2-11 yrs)',
  INF: 'Infant (0-23 months, no seat)',
};

export interface PaxCounts {
  adults: number;
  children: number;
  infants: number;
}

// ======================================================
// AIRPORT
// ======================================================

export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  timezone?: string;
}

// ======================================================
// FARE CLASS
// ======================================================

export interface FareClass {
  id: number;
  code: string;
  name: string;
  seat_class_id: number;
  refundable: boolean;
  rescheduleable: boolean;
  baggage_kg: number;
}


export interface AircraftSeat {
  id: number;
  aircraft_id: number;
  seat_number: string; // e.g. "12A"
  row_number: number;
  seat_letter: string;
  seat_class_id: number;
  seat_type: string;
  x_position: number | null;
  is_exit_row: boolean;
}

export interface FlightSeat {
  id: number;
  flight_id: number;
  status: string; // AVAILABLE | LOCKED | BOOKED | CHECKED_IN | BLOCKED
  seat_number: string;
  row_number: number;
  seat_letter: string;
  seat_class_id: number;
  seat_type: string;
  is_exit_row: boolean;
}

// ======================================================
// FLIGHT / ITINERARY / SEARCH
// ======================================================

export interface SeatClass {
  id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
export interface Flight {
  id: number;
  schedule_id: number;
  aircraft_id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
}

export interface ItinerarySegment {
  flight_id: number;
  flight_number: string;
  departure_airport_id: number;
  departure_airport_code: string;
  departure_airport_name: string;
  arrival_airport_id: number;
  arrival_airport_code: string;
  arrival_airport_name: string;
  aircraft_id: number;
  departure_time: string;
  arrival_time: string;
  status: string;
}

export interface ItineraryFare {
  fare_class_id: number;
  /** passenger_type (ADT/CHD/INF) -> decimal price string. Only types this fare is actually sellable to are present. */
  prices: Record<string, string>;
  currency: string;
  available_seats: number; // bottleneck: min across the itinerary's segments
}

export interface Itinerary {
  stops: number; // 0 = direct, 1 = one connection
  aircraft_changed: boolean[]; // length == stops
  duration_minutes: number;
  segments: ItinerarySegment[];
  fares: ItineraryFare[];
}

export type TripType = 'ONE_WAY' | 'ROUND_TRIP';

export interface FlightSearchResponse {
  trip_type: TripType;
  departure: Itinerary[];
  return?: Itinerary[];
}

// ======================================================
// BOOKING FLOW (all built client-side while the user steps
// through search -> passengers -> seats -> ancillaries -> pay;
// nothing here is persisted server-side until CreateBooking)
// ======================================================

/** One chosen itinerary (outbound, or outbound+return) with its selected fare_class_id per leg. */
export interface SelectedItinerary {
  itinerary: Itinerary;
  fareClassId: number;
}

export interface PassengerFormInput {
  passenger_type: PassengerType;
  title?: string;
  first_name: string;
  last_name?: string;
  gender?: string;
  birth_date?: string; // "YYYY-MM-DD"
  nationality?: string;
  document_type?: string;
  document_number?: string;
  document_expired_at?: string;
}

export interface ContactInput {
  full_name: string;
  email?: string;
  phone: string;
}

/** One seat, for one passenger, on one segment. Required for every non-infant passenger x segment pair. */
export interface SeatSelectionInput {
  passenger_index: number;
  segment_index: number;
  flight_seat_id: number;
}

/** POST /bookings/pnrs body. Public -- no auth required. */
export interface CreateBookingInput {
  contact: ContactInput;
  passengers: PassengerFormInput[];
  segments: Array<{ flight_id: number; fare_class_id: number }>;
  seat_selections: SeatSelectionInput[];
  hold_ttl_seconds?: number; // 0 -> server default (10 min)
}

// ======================================================
// PNR DETAIL -- response of POST /bookings/pnrs (create), GET
// /bookings/pnrs/{id} (admin), and GET /bookings/pnrs/mine/{code}.
//
// Previously this mixed PascalCase (PNR-level fields, ancillaries) with
// snake_case (passengers/segments/seats) because contract.PNRInfo and
// PNRAncillaryInfo had no json tags. Fixed backend-side on 2026-09-18
// (json tags added to both) -- everything below is now consistently
// snake_case. HoldExpiresAt/CreatedBy use Go's `,omitempty` on a nil
// pointer, so they're OMITTED from the response entirely when null,
// not sent as `null` -- typed as optional (`?`) below, not `| null`.
// ======================================================

export interface PassengerDetail {
  id: number;
  passenger_type: PassengerType;
  title: string;
  first_name: string;
  last_name: string;
  gender: string;
  birth_date: string | null;
  nationality: string;
  document_type: string;
  document_number: string;
  document_expired_at: string | null;
}

export interface SegmentDetail {
  id: number;
  flight_id: number;
  fare_class_id: number;
  status: string; // segment status (BOOKED, ...)
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  flight_status: string; // flight's own status (SCHEDULED, ...) -- distinct from `status` above
}

export interface SeatDetail {
  passenger_id: number;
  segment_id: number;
  flight_seat_id: number;
  seat_number: string;
}

/** One purchased ancillary as nested inside PNRDetail. NOT the same shape
 * as AncillaryPurchase (the booking_ancillaries row returned by the
 * ancillary module's own endpoints) below -- different struct/endpoint,
 * even though both are now snake_case. passenger_id/segment_id are
 * omitted (not null) when the add-on applies to the whole PNR / isn't
 * tied to one segment (Go `,omitempty` on a nil pointer). */
export interface PNRAncillaryDetail {
  id: number;
  passenger_id?: number;
  segment_id?: number;
  ancillary_code: string;
  ancillary_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: string; // ACTIVE, CANCELLED, USED
  payment_status: string;
}

export interface PNRDetail {
  id: number;
  booking_code: string;
  status: string; // HOLD, BOOKED, CANCELLED, EXPIRED
  payment_status: string; // UNPAID, PENDING, PAID, FAILED, EXPIRED, REFUNDED
  total_amount: string;
  currency: string;
  hold_expires_at?: string; // absent if the PNR isn't (or is no longer) in HOLD
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  created_by?: number; // absent for a guest booking
  passengers: PassengerDetail[];
  segments: SegmentDetail[];
  seats: SeatDetail[];
  ancillaries: PNRAncillaryDetail[];
}

// ======================================================
// TRANSACTION HISTORY (GET /bookings/pnrs/mine -- login required)
// ======================================================

export interface PNRSummary {
  id: number;
  booking_code: string;
  status: string;
  payment_status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  expires_at?: string;
}

export interface ListPNRsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListPNRsResult {
  items: PNRSummary[];
  total: number;
  page: number;
  limit: number;
}

// ======================================================
// PAYMENT
// ======================================================

export interface Payment {
  ID: number;
  PaymentCode: string;
  PNRID: number;
  Amount: string;
  Currency: string;
  Method: string;
  Status: string; // UNPAID, PENDING, PAID, FAILED, EXPIRED, REFUNDED
  ExpiredAt?: string | null;
  PaidAt?: string | null;
}

/** The `payment` half of POST /payments' response -- the VA number, its
 * expiry, and how the amount breaks down between the ticket and any
 * ancillaries. Consistently snake_case (this struct has real json tags). */
export interface PaymentInfo {
  payment_id: number;
  payment_code: string;
  virtual_account_no: string;
  channel: string;
  expired_at: string;
  amount: string;
  currency: string;
  ticket_portion: string;
  ancillary_portion: string;
}

/** POST /payments response. As of the "update response booking" backend
 * change, this is no longer a flat object -- it nests payment info under
 * `payment` and the full PNR detail (same shape/casing caveats as
 * PNRDetail above) under `pnr`, so the frontend doesn't need a second
 * round trip right after paying. `pnr` is omitted (undefined) if the
 * backend's own follow-up detail read failed -- treat it as optional. */
export interface CreatePaymentResponse {
  payment: PaymentInfo;
  pnr?: PNRDetail;
}

/** POST /payments body. Public. `channel` is the DOKU payment channel (e.g. "VIRTUAL_ACCOUNT_BCA", "QRIS"); leave unset for the default. `payment_method` defaults to "DOKU_VA" if omitted; "BALANCE" requires login AND that this PNR belongs to the logged-in user -- never offer BALANCE to a guest or for someone else's PNR, the backend rejects both. */
export interface CreatePaymentInput {
  pnr_id: number;
  channel?: string;
  payment_method?: 'DOKU_VA' | 'BALANCE';
}

// ======================================================
// WALLET (login required for all of these -- see services/api-services/wallet.ts)
// ======================================================

export interface WalletBalance {
  balance: string;
  currency: string;
}

export interface WalletTransaction {
  id: number;
  type: 'TOPUP' | 'PAYMENT_DEBIT' | 'REFUND_CREDIT' | 'ADJUSTMENT';
  amount: string;
  balance_after: string;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  created_at: string;
}

/** GET /wallet/transactions response shape -- NOT the shared ListResponse<T> (Items/Total, capitalized): this endpoint predates that convention and uses its own lowercase items/total/page/limit. */
export interface WalletTransactionsResult {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
}

/** POST /wallet/topup body. `channel` is the DOKU VA bank channel, same set as payments; leave unset for the default. */
export interface TopupInput {
  amount: number;
  channel?: string;
}

export interface TopupResult {
  topup_code: string;
  virtual_account_no: string;
  channel: string;
  expired_at: string;
  amount: string;
  currency: string;
}

/** GET /wallet/topup/{code} -- poll this while waiting for the DOKU notification to land, same pattern as paymentsApi.getLatestPaymentByPnr. */
export interface TopupStatus {
  topup_code: string;
  status: string; // PENDING, PAID, FAILED, EXPIRED
  amount: string;
  currency: string;
  virtual_account_no?: string;
  channel?: string;
  expired_at?: string;
  paid_at?: string;
}

// ======================================================
// ANCILLARY
// ======================================================

export interface AncillaryCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

/** GET /ancillaries catalog row -- note the PascalCase, this is what the server actually returns for this endpoint. */
export interface CatalogItem {
  ID: number;
  CategoryID: number;
  Code: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  CurrentPrice?: string | null;
  Currency?: string;
  /** Only present from getFlightCatalog -- how many are left for that specific flight. Absent/null everywhere else. */
  AvailableQuantity?: number | null;
}

/** booking_ancillaries row -- a purchased ancillary. */
export interface AncillaryPurchase {
  id: number;
  pnr_id: number;
  passenger_id: number | null;
  segment_id: number | null;
  ancillary_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'ACTIVE' | 'CANCELLED' | string;
  payment_status: 'UNPAID' | 'PAID' | string;
}

/** POST /ancillaries/purchases body. Public. flight_id is required in practice now -- see ancillary.ts purchase() note on why. */
export interface PurchaseAncillaryInput {
  pnr_id: number;
  ancillary_id: number;
  flight_id: number;
  passenger_id?: number;
  segment_id?: number;
  quantity: number;
}

/** One ancillary chosen for one specific flight, before it's actually purchased. */
export interface SelectedAncillary {
  flightId: number;
  ancillaryId: number;
  quantity: number;
  /** Carried along so ReviewStep can total/display without re-fetching every flight's catalog. */
  name: string;
  unitPrice: string;
  currency: string;
}
