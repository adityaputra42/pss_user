import { useState } from 'react';
import clsx from 'clsx';
import { PlaneTakeoff, ArrowRight, Clock } from 'lucide-react';

import type { Itinerary, FareClass, PaxCounts } from '../../types/api';
import { formatTime, formatDate, formatDuration, formatMoney } from '../../utils/format';

interface ItineraryResultCardProps {
  itinerary: Itinerary;
  fareClasses: Map<number, FareClass>;
  pax: PaxCounts;
  selectedFareClassId: number | null;
  onSelect: (fareClassId: number) => void;
}

/** Total for one fare across the passenger mix -- infants (INF) only cost something if the fare actually prices them; many fares don't. */
const fareTotalForPax = (prices: Record<string, string>, pax: PaxCounts) => {
  const adt = Number(prices.ADT ?? 0) * pax.adults;
  const chd = Number(prices.CHD ?? 0) * pax.children;
  const inf = Number(prices.INF ?? 0) * pax.infants;
  return adt + chd + inf;
};

const ItineraryResultCard: React.FC<ItineraryResultCardProps> = ({
  itinerary,
  fareClasses,
  pax,
  selectedFareClassId,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);
  const first = itinerary.segments[0];
  const last = itinerary.segments[itinerary.segments.length - 1];

  // Only fares that actually cover every passenger type in this search are sellable for it.
  const sellableFares = itinerary.fares.filter((f) =>
    (pax.adults > 0 ? f.prices.ADT != null : true) &&
    (pax.children > 0 ? f.prices.CHD != null : true) &&
    (pax.infants > 0 ? f.prices.INF != null : true) &&
    f.available_seats >= pax.adults + pax.children,
  );

  const cheapest = sellableFares.reduce<number | null>(
    (min, f) => {
      const total = fareTotalForPax(f.prices, pax);
      return min === null || total < min ? total : min;
    },
    null,
  );

  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={() => setExpanded((v) => !v)} className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 flex items-center gap-4 sm:gap-6">
          <div>
            <div className="font-display font-bold text-lg">{formatTime(first.departure_time)}</div>
            <div className="text-xs text-muted">{first.departure_airport_code}</div>
          </div>
          <div className="flex-1 flex flex-col items-center min-w-[80px]">
            <div className="text-[11px] text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formatDuration(itinerary.duration_minutes)}
            </div>
            <div className="w-full flex items-center gap-1 my-1">
              <span className="h-px flex-1 bg-slate-200" />
              <PlaneTakeoff className="w-3.5 h-3.5 text-primary" />
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="text-[11px] text-muted">
              {itinerary.stops === 0 ? 'Direct' : `${itinerary.stops} stop${itinerary.stops > 1 ? 's' : ''}`}
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-lg">{formatTime(last.arrival_time)}</div>
            <div className="text-xs text-muted">{last.arrival_airport_code}</div>
          </div>
        </div>

        <div className="sm:text-right sm:pl-4 sm:border-l border-slate-100">
          <div className="text-[11px] text-muted">From</div>
          <div className="font-display font-bold text-xl text-primary">
            {cheapest !== null ? formatMoney(cheapest, itinerary.fares[0]?.currency ?? 'IDR') : 'Unavailable'}
          </div>
          <div className="text-[11px] text-muted">for {pax.adults + pax.children + pax.infants} passenger(s)</div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 p-5 bg-slate-50/60 space-y-4">
          <div className="text-xs text-muted">
            {formatDate(first.departure_time)} · {first.flight_number}
            {itinerary.segments.length > 1 && ` + ${itinerary.segments.length - 1} more leg(s)`}
          </div>

          {sellableFares.length === 0 ? (
            <p className="text-sm text-muted">
              No fare on this itinerary covers your passenger mix or has enough seats -- try a different flight.
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-3">
              {sellableFares.map((fare) => {
                const fc = fareClasses.get(fare.fare_class_id);
                const total = fareTotalForPax(fare.prices, pax);
                const active = selectedFareClassId === fare.fare_class_id;
                return (
                  <button
                    key={fare.fare_class_id}
                    type="button"
                    onClick={() => onSelect(fare.fare_class_id)}
                    className={clsx(
                      'text-left rounded-md border p-3.5 transition-colors',
                      active ? 'border-primary bg-primary-soft' : 'border-slate-200 bg-white hover:border-primary/40',
                    )}
                  >
                    <div className="font-semibold text-sm">{fc ? fc.name : `Fare #${fare.fare_class_id}`}</div>
                    <div className="text-[11px] text-muted mb-2">
                      {fc?.refundable ? 'Refundable' : 'Non-refundable'} · {fc?.baggage_kg ?? 0}kg baggage
                    </div>
                    <div className="font-display font-bold text-primary">{formatMoney(total, fare.currency)}</div>
                    <div className="text-[11px] text-muted">{fare.available_seats} seats left</div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end">
            <span className="text-xs text-muted flex items-center gap-1">
              Select a fare, then continue below <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryResultCard;
