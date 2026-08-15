import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Search,
  Plane,
  X,
} from 'lucide-react';

import type { Airport } from '../../types/api';

interface AirportPickerProps {
  label: string;
  airports: Airport[];
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  excludeId?: Airport['id'] | null;
}

const AirportPicker: React.FC<AirportPickerProps> = ({
  label,
  airports,
  value,
  onChange,
  placeholder = 'Select airport',
  excludeId = null,
}) => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  // --------------------------------------------------
  // Filter airport
  // --------------------------------------------------

  const filteredAirports = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return airports.filter((airport) => {
      // Jangan tampilkan airport yang sedang
      // dipilih di picker satunya.
      if (
        excludeId !== null &&
        airport.id === excludeId
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        airport.code,
        airport.name,
        airport.city,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(keyword),
        );
    });
  }, [
    airports,
    search,
    excludeId,
  ]);

  // --------------------------------------------------
  // Close outside
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
        setSearch('');
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      );
    };
  }, []);

  // --------------------------------------------------
  // Open picker
  // --------------------------------------------------

  const handleOpen = () => {
    setOpen(true);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  // --------------------------------------------------
  // Select airport
  // --------------------------------------------------

  const handleSelect = (
    airport: Airport,
  ) => {
    onChange(airport);
    setOpen(false);
    setSearch('');
  };

  // --------------------------------------------------
  // Clear
  // --------------------------------------------------

  const handleClear = (
    event: React.MouseEvent,
  ) => {
    event.stopPropagation();

    onChange(null);
    setSearch('');
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Label */}
      <label className="block text-[11px] font-medium text-muted uppercase tracking-wide mb-1">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`
          field-shell
          w-full
          min-h-12
          text-left
          cursor-pointer
          outline-none
          transition-all
          ${
            open
              ? 'border-primary ring-2 ring-primary/20'
              : 'hover:border-slate-300'
          }
        `}
      >
        {value ? (
          <>
            {/* Selected airport icon */}
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4 text-primary" />
            </div>

            {/* Selected airport */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-800">
                  {value.code}
                </span>

                <span className="text-sm text-slate-500 truncate">
                  {value.city}
                </span>
              </div>

              <div className="text-xs text-slate-400 truncate">
                {value.name}
              </div>
            </div>

            {/* Clear */}
            <button
              type="button"
              onClick={handleClear}
              className="
                w-7
                h-7
                rounded-full
                flex
                items-center
                justify-center
                text-slate-400
                hover:bg-slate-100
                hover:text-slate-600
                shrink-0
              "
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            {/* Empty icon */}
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Plane className="w-4 h-4 text-slate-400" />
            </div>

            {/* Placeholder */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-700">
                {placeholder}
              </div>

              <div className="text-xs text-slate-400">
                Search city or airport
              </div>
            </div>

            <ChevronDown
              className={`
                w-4
                h-4
                text-slate-400
                shrink-0
                transition-transform
                ${open ? 'rotate-180' : ''}
              `}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            z-9999
            left-0
            right-0
            mt-2
            bg-white
            rounded-2xl
            border
            border-slate-200
            shadow-xl
            overflow-hidden
          "
        >
          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-slate-400
                "
              />

              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
                placeholder="Search city or airport..."
                className="
                  w-full
                  h-10
                  pl-9
                  pr-3
                  rounded-lg
                  bg-slate-50
                  border
                  border-transparent
                  text-sm
                  outline-none
                  placeholder:text-slate-400
                  focus:bg-white
                  focus:border-primary/30
                  focus:ring-2
                  focus:ring-primary/10
                "
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto p-2">
            {filteredAirports.length > 0 ? (
              filteredAirports.map(
                (airport) => {
                  const selected =
                    value?.id ===
                    airport.id;

                  return (
                    <button
                      key={airport.id}
                      type="button"
                      onClick={() =>
                        handleSelect(
                          airport,
                        )
                      }
                      className="
                        w-full
                        px-3
                        py-3
                        rounded-xl
                        flex
                        items-center
                        gap-3
                        text-left
                        hover:bg-slate-50
                        transition-colors
                      "
                    >
                      {/* Icon */}
                      <div
                        className={`
                          w-10
                          h-10
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          shrink-0
                          ${
                            selected
                              ? 'bg-primary/10'
                              : 'bg-slate-100'
                          }
                        `}
                      >
                        <Plane
                          className={`
                            w-4
                            h-4
                            ${
                              selected
                                ? 'text-primary'
                                : 'text-slate-400'
                            }
                          `}
                        />
                      </div>

                      {/* Airport info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {airport.code}
                          </span>

                          <span className="text-sm text-slate-500 truncate">
                            {airport.city}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 truncate mt-0.5">
                          {airport.name}
                        </div>
                      </div>

                      {/* Selected */}
                      {selected && (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                },
              )
            ) : (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>

                <p className="text-sm font-medium text-slate-600">
                  No airport found
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Try another city or airport
                </p>
              </div>
            )}
          </div>

          {/* Result count */}
          {filteredAirports.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <span className="text-[11px] text-slate-400">
                {filteredAirports.length}{' '}
                airports available
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportPicker;
