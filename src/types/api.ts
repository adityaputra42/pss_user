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

// ======================================================
// AIRCRAFT SEAT LAYOUT
// (used for seat-map display during booking -- see booking.ts note:
// there is no per-flight "which seats are already taken" endpoint, so
// this is the full physical layout; occupied seats surface only as a
// 409 from the server when a hold is attempted.)
// ======================================================

export interface AircraftSeat {
  id: number;
  aircraft_id: number;
  seat_number: string; // e.g. "12A"
  row_number: number;
  seat_letter: string;
  seat_class_id: number;
  seat_type: string;
  /** Index of seat_letter within its row-group's letter string at generation time (e.g. "ABCDEF" -> A=0..F=5). Does NOT account for aisle gaps -- there's no aisle marker from the backend, just consecutive indices. */
  x_position: number | null;
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

export interface PNR {
  PNRID: number;
  BookingCode: string;
  Status: string; // HOLD, BOOKED, CANCELLED, EXPIRED
  ExpiresAt: string;
  TotalAmount: number;
  Currency: string;
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

/** POST /payments response -- distinct shape from the PaymentView above (this is what you actually pay against: the VA number, its expiry, and how the amount breaks down between the ticket and any ancillaries). */
export interface CreatePaymentResult {
  payment_id: number;
  payment_code: string;
  channel: string;
  amount: string;
  currency: string;
  ticket_portion: string;
  ancillary_portion: string;
  virtual_account_no: string;
  expired_at: string;
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
