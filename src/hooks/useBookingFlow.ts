import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Itinerary,
  PassengerFormInput,
  ContactInput,
  SeatSelectionInput,
  PNR,
  PaxCounts,
} from '../types/api';

interface BookingFlowState {
  totalPax: PaxCounts;

  outboundItinerary: Itinerary | null;
  outboundFareClassId: number | null;
  returnItinerary: Itinerary | null;
  returnFareClassId: number | null;

  passengers: PassengerFormInput[];
  contact: ContactInput | null;

  seatSelections: SeatSelectionInput[];

  pnr: PNR | null;

  setTotalPax: (v: PaxCounts) => void;
  setOutbound: (itinerary: Itinerary, fareClassId: number) => void;
  setReturn: (itinerary: Itinerary | null, fareClassId: number | null) => void;
  setPassengers: (passengers: PassengerFormInput[]) => void;
  setContact: (contact: ContactInput) => void;
  setSeatSelections: (selections: SeatSelectionInput[]) => void;
  setPnr: (pnr: PNR | null) => void;
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
