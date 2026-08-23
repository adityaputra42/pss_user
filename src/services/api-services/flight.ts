import api from '../api-client';
import type {
  Airport,
  FareClass,
  FlightSearchResponse,
  AircraftSeat,
  FlightSeat,
  ApiResponse,
  ListResponse,
} from '../../types/api';

export const airportsApi = {
  /** GET /flights/airports -- public. */
  async getAirports(): Promise<ListResponse<Airport>> {
    const response = await api.get<ApiResponse<ListResponse<Airport>>>('/flights/airports', {
      params: { limit: 200 },
    });
    return response.data.data ?? { Items: [], Total: 0 };
  },
};

export const fareClassesApi = {
  /** GET /flights/fare-classes -- public. Used to label a fare_class_id in search results (e.g. "Y — Economy Flex"). */
  async getFareClasses(): Promise<ListResponse<FareClass>> {
    const response = await api.get<ApiResponse<ListResponse<FareClass>>>('/flights/fare-classes', {
      params: { limit: 200 },
    });
    return response.data.data ?? { Items: [], Total: 0 };
  },
};

export const flightsApi = {
  /**
   * GET /flights/search -- public. total_pax is required server-side
   * (400 without it); it's total headcount including infants, matching
   * how the passenger picker counts them.
   */
  async searchFlights(params: {
    departureAirportId: number;
    arrivalAirportId: number;
    date: string; // YYYY-MM-DD
    totalPax: number;
    tripType?: 'one_way' | 'round_trip';
    returnDate?: string; // YYYY-MM-DD, required when tripType is 'round_trip'
    maxStops?: number;
    seatClassId?: number;
    page?: number;
    limit?: number;
  }): Promise<FlightSearchResponse> {
    const response = await api.get<ApiResponse<FlightSearchResponse>>('/flights/search', {
      params: {
        departure_airport_id: params.departureAirportId,
        arrival_airport_id: params.arrivalAirportId,
        date: params.date,
        total_pax: params.totalPax,
        trip_type: params.tripType ?? 'one_way',
        return_date: params.returnDate || undefined,
        max_stops: params.maxStops,
        seat_class_id: params.seatClassId || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 20,
      },
    });
    return response.data.data ?? { trip_type: 'ONE_WAY', departure: [] };
  },


  async getAircraftSeats(aircraftId: number): Promise<AircraftSeat[]> {
    const response = await api.get<ApiResponse<AircraftSeat[]>>(`/flights/aircrafts/${aircraftId}/seats`);
    return response.data.data ?? [];
  },

  async getFlightSeats(flightId: number): Promise<FlightSeat[]> {
    const response = await api.get<ApiResponse<FlightSeat[]>>(`/flights/instances/${flightId}/seats`);
    return response.data.data ?? [];
  },
};
