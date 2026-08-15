import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { ChevronLeft, Package, Minus, Plus } from 'lucide-react';

import type { CatalogItem, ItinerarySegment, SelectedAncillary } from '../../types/api';
import { ancillariesApi } from '../../services/api-services';
import { formatMoney } from '../../utils/format';
import Skeleton from '../animations/Skeleton';

interface ExtrasStepProps {
  segments: ItinerarySegment[];
  selections: SelectedAncillary[];
  onChange: (selections: SelectedAncillary[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const ExtrasStep: React.FC<ExtrasStepProps> = ({ segments, selections, onChange, onBack, onNext }) => {
  const [activeSegment, setActiveSegment] = useState(0);
  const [catalogByFlight, setCatalogByFlight] = useState<Map<number, CatalogItem[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const flightIds = [...new Set(segments.map((s) => s.flight_id))];
    Promise.all(flightIds.map((id) => ancillariesApi.getFlightCatalog(id).then((items) => [id, items] as const)))
      .then((pairs) => setCatalogByFlight(new Map(pairs)))
      .finally(() => setLoading(false));
  }, [segments]);

  const seg = segments[activeSegment];
  const catalog = catalogByFlight.get(seg?.flight_id) ?? [];

  const qtyFor = (ancillaryId: number) =>
    selections.find((s) => s.flightId === seg.flight_id && s.ancillaryId === ancillaryId)?.quantity ?? 0;

  const setQty = (item: CatalogItem, qty: number) => {
    const capped = Math.max(0, Math.min(qty, item.AvailableQuantity ?? qty));
    const next = selections.filter((s) => !(s.flightId === seg.flight_id && s.ancillaryId === item.ID));
    if (capped > 0) {
      next.push({
        flightId: seg.flight_id,
        ancillaryId: item.ID,
        quantity: capped,
        name: item.Name,
        unitPrice: item.CurrentPrice ?? '0',
        currency: item.Currency ?? 'IDR',
      });
    }
    onChange(next);
  };

  const totalSelectedCount = selections.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-5">
      {segments.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {segments.map((s, i) => {
            const count = selections.filter((sel) => sel.flightId === s.flight_id).length;
            return (
              <button
                key={i}
                onClick={() => setActiveSegment(i)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5',
                  activeSegment === i ? 'bg-primary text-white' : 'bg-slate-100 text-muted',
                )}
              >
                {s.departure_airport_code} → {s.arrival_airport_code}
                {count > 0 && (
                  <span className={clsx('rounded-full text-[10px] w-4 h-4 flex items-center justify-center', activeSegment === i ? 'bg-white/25' : 'bg-primary/15 text-primary')}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold">
            Add extras {segments.length > 1 && <span className="font-normal text-muted text-sm">for {seg?.departure_airport_code} → {seg?.arrival_airport_code}</span>}
          </h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Optional -- only what's actually offered on this specific flight shows up here. Applied to your
          booking as a whole rather than to one passenger, and billed together with your flight on the next step.
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : catalog.length === 0 ? (
          <p className="text-sm text-muted">No extras offered on this flight -- you can skip this step.</p>
        ) : (
          <div className="space-y-2">
            {catalog.map((item) => {
              const qty = qtyFor(item.ID);
              const maxed = item.AvailableQuantity != null && qty >= item.AvailableQuantity;
              return (
                <div key={item.ID} className="flex items-center justify-between gap-3 bg-slate-50/70 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{item.Name}</div>
                    {item.Description && <div className="text-xs text-muted truncate">{item.Description}</div>}
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.CurrentPrice && (
                        <span className="text-xs font-semibold text-primary">
                          {formatMoney(item.CurrentPrice, item.Currency ?? 'IDR')} each
                        </span>
                      )}
                      {item.AvailableQuantity != null && (
                        <span className="text-[11px] text-muted">· {item.AvailableQuantity} left</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQty(item, qty - 1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item, qty + 1)}
                      disabled={maxed}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-6 py-3 text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
        <button onClick={onNext} className="btn-primary px-8 py-3 text-sm">
          Continue to review{totalSelectedCount > 0 && ` (${totalSelectedCount} extra${totalSelectedCount > 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  );
};

export default ExtrasStep;
