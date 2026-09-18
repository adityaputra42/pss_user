import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Itinerary,
  PassengerFormInput,
  ContactInput,
  SeatSelectionInput,
  PNRDetail,
  PaxCounts,
} from '../types/api';

interface BookingFlowState {
  // -- Step 1: search context, kept so "back" doesn't lose it --
  totalPax: PaxCounts;

  // -- Step 2: chosen itinerary/fare --
  outboundItinerary: Itinerary | null;
  outboundFareClassId: number | null;
  returnItinerary: Itinerary | null;
  returnFareClassId: number | null;

  // -- Step 3: passengers + contact --
  passengers: PassengerFormInput[];
  contact: ContactInput | null;

  seatSelections: SeatSelectionInput[];

  pnr: PNRDetail | null;

  setTotalPax: (v: PaxCounts) => void;
  setOutbound: (itinerary: Itinerary, fareClassId: number) => void;
  setReturn: (itinerary: Itinerary | null, fareClassId: number | null) => void;
  setPassengers: (passengers: PassengerFormInput[]) => void;
  setContact: (contact: ContactInput) => void;
  setSeatSelections: (selections: SeatSelectionInput[]) => void;
  setPnr: (pnr: PNRDetail | null) => void;
  reset: () => void;
}

const initial = {
  totalPax: { adults: 1, children: 0, infants: 0 },
  outboundItinerary: null,
  outboundFareClassId: null,
  returnItinerary: null,
  returnFareClassId: null,
  passengers: [],
  contact: null,
  seatSelections: [],
  pnr: null,
} satisfies Partial<BookingFlowState>;

/**
 * Persisted to sessionStorage (not localStorage) -- survives a page
 * refresh mid-flow, but clears when the tab closes, which is the right
 * lifetime for "no login, no tracked history": nothing here is meant
 * to outlive the visit, only the current booking attempt.
 */
export const useBookingFlow = create<BookingFlowState>()(
  persist(
    (set) => ({
      ...initial,
      setTotalPax: (totalPax) => set({ totalPax }),
      setOutbound: (outboundItinerary, outboundFareClassId) => set({ outboundItinerary, outboundFareClassId }),
      setReturn: (returnItinerary, returnFareClassId) => set({ returnItinerary, returnFareClassId }),
      setPassengers: (passengers) => set({ passengers }),
      setContact: (contact) => set({ contact }),
      setSeatSelections: (seatSelections) => set({ seatSelections }),
      setPnr: (pnr) => set({ pnr }),
      reset: () => set({ ...initial }),
    }),
    { name: 'guest-booking-flow', storage: createJSONStorage(() => sessionStorage) },
  ),
);
