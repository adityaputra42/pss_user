import { useEffect, useState } from 'react';
import { ChevronLeft, Package, Minus, Plus } from 'lucide-react';

import type { CatalogItem } from '../../types/api';
import { ancillariesApi } from '../../services/api-services';
import { formatMoney } from '../../utils/format';
import Skeleton from '../animations/Skeleton';

interface ExtrasStepProps {
  quantities: Map<number, number>;
  onChange: (quantities: Map<number, number>) => void;
  onBack: () => void;
  onNext: () => void;
}

const ExtrasStep: React.FC<ExtrasStepProps> = ({ quantities, onChange, onBack, onNext }) => {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ancillariesApi.getCatalog().then(setCatalog).finally(() => setLoading(false));
  }, []);

  const setQty = (id: number, qty: number) => {
    const next = new Map(quantities);
    if (qty <= 0) next.delete(id);
    else next.set(id, qty);
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Package className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold">Add extras</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Optional -- applied to your booking as a whole rather than to one passenger, and billed together with
          your flight on the next step.
        </p>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : catalog.length === 0 ? (
          <p className="text-sm text-muted">No extras available right now -- you can skip this step.</p>
        ) : (
          <div className="space-y-2">
            {catalog.map((item) => {
              const qty = quantities.get(item.ID) ?? 0;
              return (
                <div key={item.ID} className="flex items-center justify-between gap-3 bg-slate-50/70 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{item.Name}</div>
                    {item.Description && <div className="text-xs text-muted truncate">{item.Description}</div>}
                    {item.CurrentPrice && (
                      <div className="text-xs font-semibold text-primary mt-0.5">
                        {formatMoney(item.CurrentPrice, item.Currency ?? 'IDR')} each
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQty(item.ID, qty - 1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(item.ID, qty + 1)}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center"
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
        <button onClick={onNext} className="btn-primary px-8 py-3 text-sm">Continue to review</button>
      </div>
    </div>
  );
};

export default ExtrasStep;
