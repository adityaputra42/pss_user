import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';

import type {
  ContactInput,
  Itinerary,
  PassengerFormInput,
  SeatSelectionInput,
  SelectedAncillary,
} from '../../types/api';
import { bookingsApi, ancillariesApi, paymentsApi } from '../../services/api-services';
import { formatMoney, formatDate, formatTime } from '../../utils/format';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import BounceButton from '../animations/BounceButton';

interface ReviewStepProps {
  outbound: Itinerary;
  outboundFareClassId: number;
  ret: Itinerary | null;
  returnFareClassId: number | null;
  passengers: PassengerFormInput[];
  contact: ContactInput;
  seatSelections: SeatSelectionInput[];
  ancillarySelections: SelectedAncillary[];
  onBack: () => void;
  onSeatConflict: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  outbound,
  outboundFareClassId,
  ret,
  returnFareClassId,
  passengers,
  contact,
  seatSelections,
  ancillarySelections,
  onBack,
  onSeatConflict,
}) => {
  const navigate = useNavigate();
  const setPnr = useBookingFlow((s) => s.setPnr);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [seatConflict, setSeatConflict] = useState(false);

  const outboundFare = outbound.fares.find((f) => f.fare_class_id === outboundFareClassId)!;
  const returnFare = ret && returnFareClassId ? ret.fares.find((f) => f.fare_class_id === returnFareClassId) : null;

  const fareTotal = (prices: Record<string, string>) =>
    passengers.reduce((sum, p) => sum + Number(prices[p.passenger_type] ?? 0), 0);

  const ticketTotal = fareTotal(outboundFare.prices) + (returnFare ? fareTotal(returnFare.prices) : 0);
  const ancillaryTotal = ancillarySelections.reduce((sum, s) => sum + Number(s.unitPrice) * s.quantity, 0);

  const segmentsPayload = [
    ...outbound.segments.map((s) => ({ flight_id: s.flight_id, fare_class_id: outboundFareClassId })),
    ...(ret && returnFareClassId ? ret.segments.map((s) => ({ flight_id: s.flight_id, fare_class_id: returnFareClassId })) : []),
  ];

  const submit = async () => {
    setSubmitting(true);
    setError('');
    setSeatConflict(false);
    try {
      const pnr = await bookingsApi.createBooking({
        contact,
        passengers,
        segments: segmentsPayload,
        seat_selections: seatSelections,
      });
      if (!pnr) throw new Error('Booking could not be created.');
      setPnr(pnr);

      // flight_id is required here now -- it's the whitelist check
      // (see ancillary.ts purchase() note). Each selection already
      // knows which flight it was chosen for from ExtrasStep.
      for (const sel of ancillarySelections) {
        if (sel.quantity <= 0) continue;
        await ancillariesApi.purchase({
          pnr_id: pnr.PNRID,
          ancillary_id: sel.ancillaryId,
          flight_id: sel.flightId,
          quantity: sel.quantity,
        });
      }

      const payment = await paymentsApi.createPayment({ pnr_id: pnr.PNRID });
      navigate('/confirmation', { state: { payment } });
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Something went wrong -- please try again.';
      if (status === 409) setSeatConflict(true);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-display font-bold mb-4">Review your trip</h3>

        {[{ it: outbound, fare: outboundFare, label: 'Departing' }, ...(ret && returnFare ? [{ it: ret, fare: returnFare, label: 'Returning' }] : [])].map(
          ({ it, fare, label }) => (
            <div key={label} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-slate-100">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{label}</div>
              <div className="text-sm">
                {it.segments[0].departure_airport_code} → {it.segments[it.segments.length - 1].arrival_airport_code}
                {' · '}
                {formatDate(it.segments[0].departure_time)} · {formatTime(it.segments[0].departure_time)}
              </div>
              <div className="text-xs text-muted">{fare.currency} fare · {formatMoney(fareTotal(fare.prices), fare.currency)}</div>
            </div>
          ),
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm text-muted">Passengers ({passengers.length})</span>
          <span className="text-sm font-medium">{formatMoney(ticketTotal, outboundFare.currency)}</span>
        </div>
        {ancillaryTotal > 0 && (
          <div className="mt-1 space-y-1">
            {ancillarySelections.map((s) => (
              <div key={`${s.flightId}-${s.ancillaryId}`} className="flex items-center justify-between">
                <span className="text-sm text-muted">{s.name} × {s.quantity}</span>
                <span className="text-sm font-medium">{formatMoney(Number(s.unitPrice) * s.quantity, s.currency)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="font-display font-bold">Total</span>
          <span className="font-display font-bold text-lg text-primary">
            {formatMoney(ticketTotal + ancillaryTotal, outboundFare.currency)}
          </span>
        </div>
      </div>

      {error && (
        <div className="card p-4 border-red-200 bg-red-50/60 flex gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {seatConflict ? (
              <>One of your seats was taken by someone else while you were booking. <button onClick={onSeatConflict} className="underline font-semibold">Go back and pick again</button>.</>
            ) : (
              error
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} disabled={submitting} className="btn-secondary px-6 py-3 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <BounceButton onClick={submit} disabled={submitting} className="btn-primary px-8 py-3 text-sm">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Booking…' : 'Confirm and pay'}
        </BounceButton>
      </div>
    </div>
  );
};

export default ReviewStep;
