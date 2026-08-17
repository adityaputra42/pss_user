import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Users, Plus, Minus } from 'lucide-react';

import {
  PASSENGER_TYPE_LABELS,
  type PaxCounts,
} from '../../types/api';

export type { PaxCounts };

interface PassengerPickerProps {
  value: PaxCounts;
  onChange: (value: PaxCounts) => void;
}

interface PassengerRow {
  key: keyof PaxCounts;
  label: string;
  min: number;
  help: string;
}

const rows: PassengerRow[] = [
  {
    key: 'adults',
    label: PASSENGER_TYPE_LABELS.ADT,
    min: 1,
    help: '',
  },
  {
    key: 'children',
    label: PASSENGER_TYPE_LABELS.CHD,
    min: 0,
    help: '',
  },
  {
    key: 'infants',
    label: PASSENGER_TYPE_LABELS.INF,
    min: 0,
    help: 'Max 1 per adult',
  },
];

const PassengerPicker: React.FC<PassengerPickerProps> = ({
  value,
  onChange,
}) => {
  const total =
    value.adults +
    value.children +
    value.infants;

  const step = (
    key: keyof PaxCounts,
    delta: number,
  ) => {
    const row = rows.find(
      (item) => item.key === key,
    );

    if (!row) {
      return;
    }

    const currentValue = value[key];

    const nextValue = Math.max(
      row.min,
      currentValue + delta,
    );

    const next: PaxCounts = {
      ...value,
      [key]: nextValue,
    };

    // Infant tidak boleh lebih banyak dari adult
    if (next.infants > next.adults) {
      return;
    }

    onChange(next);
  };

  return (
    <Popover className="relative w-full">
      {({ open }) => (
        <>
          {/* Trigger */}
          <PopoverButton
            className={`
              field-shell
              w-full
              text-left
              cursor-pointer
              outline-none
              ${open ? 'ring-2 ring-primary/20 border-primary/40' : ''}
            `}
          >
            <Users className="w-4 h-4 text-slate-400 shrink-0" />

            <div className="min-w-0">
              <div className="block text-[11px] font-medium text-muted uppercase tracking-wide">
                Passengers
              </div>

              <div className="font-semibold text-sm truncate">
                {total}{' '}
                {total === 1
                  ? 'passenger'
                  : 'passengers'}
              </div>
            </div>
          </PopoverButton>

          {/* Dropdown */}
          <PopoverPanel
            transition
            anchor="bottom end"
            className="
              z-9999
              mt-2
              w-72
              rounded-md
              border
              border-slate-200
              bg-white
              shadow-xl
              p-4
              space-y-4
              outline-none
              data-closed:opacity-0
              data-closed:scale-95
              transition
              duration-150
            "
          >
            {/* Header */}
            <div className="pb-2 border-b border-slate-100">
              <div className="text-sm font-semibold text-ink">
                Passengers
              </div>

              <div className="text-xs text-muted mt-0.5">
                Select the number of passengers
              </div>
            </div>

            {/* Passenger rows */}
            {rows.map((row) => {
              const current = value[row.key];

              const disableMinus =
                current <= row.min;

              const disablePlus =
                row.key === 'infants' &&
                value.infants >= value.adults;

              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-4"
                >
                  {/* Label */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {row.label}
                    </div>

                    {row.help && (
                      <div className="text-xs text-muted mt-0.5">
                        {row.help}
                      </div>
                    )}
                  </div>

                  {/* Counter */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Minus */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        step(row.key, -1);
                      }}
                      disabled={disableMinus}
                      className="
                        w-8
                        h-8
                        rounded-sm
                        border
                        border-slate-200
                        flex
                        items-center
                        justify-center
                        text-slate-600
                        hover:border-primary
                        hover:text-primary
                        disabled:opacity-30
                        disabled:cursor-not-allowed
                        transition-colors
                      "
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Value */}
                    <span className="w-5 text-center text-sm font-semibold">
                      {current}
                    </span>

                    {/* Plus */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        step(row.key, 1);
                      }}
                      disabled={disablePlus}
                      className="
                        w-8
                        h-8
                        rounded-sm
                        border
                        border-slate-200
                        flex
                        items-center
                        justify-center
                        text-slate-600
                        hover:border-primary
                        hover:text-primary
                        disabled:opacity-30
                        disabled:cursor-not-allowed
                        transition-colors
                      "
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Summary */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                  Total passengers
                </span>

                <span className="text-sm font-semibold text-ink">
                  {total}
                </span>
              </div>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
};

export default PassengerPicker;
