import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

import type { AircraftSeat, ItinerarySegment, PassengerFormInput, SeatSelectionInput } from '../../types/api';
import { flightsApi } from '../../services/api-services';
import SeatMap from './SeatMap';
import Skeleton from '../animations/Skeleton';

interface SeatStepProps {
  segments: ItinerarySegment[];
  passengers: PassengerFormInput[];
  seatSelections: SeatSelectionInput[];
  onChange: (selections: SeatSelectionInput[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const SeatStep: React.FC<SeatStepProps> = ({ segments, passengers, seatSelections, onChange, onBack, onNext }) => {
  const [activeSegment, setActiveSegment] = useState(0);
  const nonInfantIdx = useMemo(
    () => passengers.map((p, i) => (p.passenger_type !== 'INF' ? i : -1)).filter((i) => i >= 0),
    [passengers],
  );
  const [activePax, setActivePax] = useState(nonInfantIdx[0] ?? 0);
  const [seatsByAircraft, setSeatsByAircraft] = useState<Map<number, AircraftSeat[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const aircraftIds = [...new Set(segments.map((s) => s.aircraft_id))];
    Promise.all(aircraftIds.map((id) => flightsApi.getAircraftSeats(id).then((seats) => [id, seats] as const)))
      .then((pairs) => setSeatsByAircraft(new Map(pairs)))
      .finally(() => setLoading(false));
  }, [segments]);

  const passengerLabels = passengers.map((p, i) => p.first_name || `Passenger ${i + 1}`);

  const assignedForSegment = (segIdx: number) => {
    const m = new Map<string, number>();
    for (const sel of seatSelections) {
      if (sel.segment_index !== segIdx) continue;
      const seat = [...seatsByAircraft.values()].flat().find((s) => s.id === sel.flight_seat_id);
      if (seat) m.set(seat.seat_number, sel.passenger_index);
    }
    return m;
  };

  const pickSeat = (seat: AircraftSeat) => {
    const next = seatSelections.filter(
      (s) => !(s.segment_index === activeSegment && s.passenger_index === activePax) && s.flight_seat_id !== seat.id,
    );
    // if another passenger already had this seat on this segment, bump them off
    const filtered = next.filter((s) => !(s.segment_index === activeSegment && s.flight_seat_id === seat.id));
    filtered.push({ passenger_index: activePax, segment_index: activeSegment, flight_seat_id: seat.id });
    onChange(filtered);

    // auto-advance to the next passenger needing a seat on this segment
    const remaining = nonInfantIdx.filter(
      (i) => i !== activePax && !filtered.some((s) => s.segment_index === activeSegment && s.passenger_index === i),
    );
    if (remaining.length > 0) setActivePax(remaining[0]);
  };

  const seg = segments[activeSegment];
  const seats = seatsByAircraft.get(seg?.aircraft_id) ?? [];
  const assigned = assignedForSegment(activeSegment);

  const complete = segments.every((_, segIdx) =>
    nonInfantIdx.every((paxIdx) => seatSelections.some((s) => s.segment_index === segIdx && s.passenger_index === paxIdx)),
  );

  return (
    <div className="space-y-5">
      {segments.length > 1 && (
        <div className="flex items-center gap-2">
          {segments.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSegment(i)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold',
                activeSegment === i ? 'bg-primary text-white' : 'bg-slate-100 text-muted',
              )}
            >
              {s.departure_airport_code} → {s.arrival_airport_code}
            </button>
          ))}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold">{seg?.departure_airport_code} → {seg?.arrival_airport_code}</h3>
            <p className="text-xs text-muted">Pick a seat for each passenger on this leg.</p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {nonInfantIdx.map((i) => {
              const hasSeat = seatSelections.some((s) => s.segment_index === activeSegment && s.passenger_index === i);
              return (
                <button
                  key={i}
                  onClick={() => setActivePax(i)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border',
                    activePax === i ? 'border-primary text-primary bg-primary-soft' : 'border-slate-200 text-muted',
                    hasSeat && activePax !== i && 'border-emerald-200 text-emerald-600 bg-emerald-50',
                  )}
                >
                  {passengerLabels[i]}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <SeatMap
            seats={seats}
            assignedBy={assigned}
            activePassengerIndex={activePax}
            passengerLabels={passengerLabels}
            onPick={pickSeat}
          />
        )}

        <p className="text-[11px] text-muted flex items-center gap-1.5 mt-3">
          <AlertTriangle className="w-3.5 h-3.5 text-accent shrink-0" />
          This is the full seat map -- seats already booked by other passengers only get rejected when you submit,
          so if a seat you picked turns out to be taken, you'll be asked to choose again for that leg.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-6 py-3 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
        <button onClick={onNext} disabled={!complete} className="btn-primary px-8 py-3 text-sm">
          Continue
        </button>
      </div>
    </div>
  );
};

export default SeatStep;
