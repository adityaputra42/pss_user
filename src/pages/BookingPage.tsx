import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import type { ContactInput, PassengerFormInput, SeatSelectionInput, SelectedAncillary } from '../types/api';
import { useBookingFlow } from '../hooks/useBookingFlow';
import PassengerStep from '../components/booking/PassengerStep';
import SeatStep from '../components/booking/SeatStep';
import ExtrasStep from '../components/booking/ExtrasStep';
import ReviewStep from '../components/booking/ReviewStep';
import Slide from '../components/animations/Slide';

const stepLabels = ['Passengers', 'Seats', 'Extras', 'Review & pay'];

const BookingPage: React.FC = () => {
  const { outboundItinerary, outboundFareClassId, returnItinerary, returnFareClassId, totalPax } = useBookingFlow();

  const [step, setStep] = useState(0);
  const [passengers, setPassengers] = useState<PassengerFormInput[]>([]);
  const [contact, setContact] = useState<ContactInput>({ full_name: '', email: '', phone: '' });
  const [seatSelections, setSeatSelections] = useState<SeatSelectionInput[]>([]);
  const [ancillarySelections, setAncillarySelections] = useState<SelectedAncillary[]>([]);

  useEffect(() => {
    if (passengers.length > 0) return;
    const built: PassengerFormInput[] = [
      ...Array(totalPax.adults).fill(null).map(() => ({ passenger_type: 'ADT' as const, first_name: '' })),
      ...Array(totalPax.children).fill(null).map(() => ({ passenger_type: 'CHD' as const, first_name: '' })),
      ...Array(totalPax.infants).fill(null).map(() => ({ passenger_type: 'INF' as const, first_name: '' })),
    ];
    setPassengers(built);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPax]);

  const allSegments = useMemo(
    () => [...(outboundItinerary?.segments ?? []), ...(returnItinerary?.segments ?? [])],
    [outboundItinerary, returnItinerary],
  );

  if (!outboundItinerary || outboundFareClassId === null) {
    return <Navigate to="/" replace />;
  }

  const updatePassenger = (index: number, patch: Partial<PassengerFormInput>) =>
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-8">
      {/* progress */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div
              className={clsx(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i < step ? 'bg-primary text-white' : i === step ? 'bg-primary-soft text-primary border-2 border-primary' : 'bg-slate-100 text-slate-400',
              )}
            >
              {i + 1}
            </div>
            <span className={clsx('text-xs font-medium hidden sm:block', i === step ? 'text-ink' : 'text-muted')}>{label}</span>
            {i < stepLabels.length - 1 && <span className="flex-1 h-px bg-slate-200" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <Slide key={step} direction="left" duration={0.25}>
          {step === 0 && (
            <PassengerStep
              passengers={passengers}
              contact={contact}
              onChangePassenger={updatePassenger}
              onChangeContact={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
              onNext={() => setStep(1)}
            />
          )}

          {step === 1 && (
            <SeatStep
              segments={allSegments}
              passengers={passengers}
              seatSelections={seatSelections}
              onChange={setSeatSelections}
              onBack={() => setStep(0)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <ExtrasStep
              segments={allSegments}
              selections={ancillarySelections}
              onChange={setAncillarySelections}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <ReviewStep
              outbound={outboundItinerary}
              outboundFareClassId={outboundFareClassId}
              ret={returnItinerary}
              returnFareClassId={returnFareClassId}
              passengers={passengers}
              contact={contact}
              seatSelections={seatSelections}
              ancillarySelections={ancillarySelections}
              onBack={() => setStep(2)}
              onSeatConflict={() => setStep(1)}
            />
          )}
        </Slide>
      </AnimatePresence>
    </div>
  );
};

export default BookingPage;
