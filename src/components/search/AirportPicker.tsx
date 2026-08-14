import { Combobox } from '@headlessui/react';
import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Airport } from '../../types/api';

interface AirportPickerProps {
  label: string;
  airports: Airport[];
  value: Airport | null;
  onChange: (airport: Airport) => void;
  placeholder?: string;
}

const AirportPicker: React.FC<AirportPickerProps> = ({ label, airports, value, onChange, placeholder }) => {
  const [query, setQuery] = useState('');

  const filtered =
    query === ''
      ? airports
      : airports.filter((a) => {
          const q = query.toLowerCase();
          return (
            a.city.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q)
          );
        });

  return (
    <Combobox value={value} onChange={(a) => a && onChange(a)}>
      <div className="field-shell">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <Combobox.Label className="block text-[11px] font-medium text-muted uppercase tracking-wide">
            {label}
          </Combobox.Label>
          <Combobox.Input
            className="input-field font-semibold text-ink"
            placeholder={placeholder ?? 'City or airport'}
            displayValue={(a: Airport | null) => (a ? `${a.city} (${a.code})` : '')}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="relative">
        <Combobox.Options className="absolute z-30 mt-2 w-full max-h-64 overflow-auto card p-1.5">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-sm text-muted">No airports match "{query}"</div>
          ) : (
            filtered.map((a) => (
              <Combobox.Option
                key={a.id}
                value={a}
                className={({ active }) =>
                  `px-3 py-2.5 rounded-lg text-sm cursor-pointer flex items-center justify-between ${
                    active ? 'bg-primary-soft' : ''
                  }`
                }
              >
                <span>
                  <span className="font-semibold">{a.city}</span>
                  <span className="text-muted"> — {a.name}</span>
                </span>
                <span className="text-xs font-bold text-primary">{a.code}</span>
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </div>
    </Combobox>
  );
};

export default AirportPicker;
