import { Popover } from '@headlessui/react';
import { Users, Plus, Minus } from 'lucide-react';
import { PASSENGER_TYPE_LABELS, type PaxCounts } from '../../types/api';

export type { PaxCounts };

interface PassengerPickerProps {
  value: PaxCounts;
  onChange: (value: PaxCounts) => void;
}

const rows: Array<{ key: keyof PaxCounts; label: string; min: number; help: string }> = [
  { key: 'adults', label: PASSENGER_TYPE_LABELS.ADT, min: 1, help: '' },
  { key: 'children', label: PASSENGER_TYPE_LABELS.CHD, min: 0, help: '' },
  { key: 'infants', label: PASSENGER_TYPE_LABELS.INF, min: 0, help: 'Max 1 per adult' },
];

const PassengerPicker: React.FC<PassengerPickerProps> = ({ value, onChange }) => {
  const total = value.adults + value.children + value.infants;

  const step = (key: keyof PaxCounts, delta: number) => {
    const next = { ...value, [key]: Math.max(rows.find((r) => r.key === key)!.min, value[key] + delta) };
    if (next.infants > next.adults) return; // an infant needs an adult's lap
    onChange(next);
  };

  return (
    <Popover className="relative">
      <Popover.Button className="field-shell w-full text-left">
        <Users className="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <div className="block text-[11px] font-medium text-muted uppercase tracking-wide">Passengers</div>
          <div className="font-semibold text-sm">
            {total} {total === 1 ? 'passenger' : 'passengers'}
          </div>
        </div>
      </Popover.Button>
      <Popover.Panel className="absolute z-30 mt-2 right-0 w-72 card p-4 space-y-3">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{r.label}</div>
              {r.help && <div className="text-xs text-muted">{r.help}</div>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(r.key, -1)}
                disabled={value[r.key] <= r.min}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center disabled:opacity-30"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-semibold">{value[r.key]}</span>
              <button
                type="button"
                onClick={() => step(r.key, 1)}
                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </Popover.Panel>
    </Popover>
  );
};

export default PassengerPicker;
