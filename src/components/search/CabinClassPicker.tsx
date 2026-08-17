import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Loader2,
} from 'lucide-react';

import type { SeatClass } from '../../types/api';
import { seatClassesApi } from '../../services/api-services/class';

interface CabinClassPickerProps {
  value: SeatClass | null;
  onChange: (value: SeatClass | null) => void;
}

const CabinClassPicker: React.FC<
  CabinClassPickerProps
> = ({ value, onChange }) => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [seatClasses, setSeatClasses] =
    useState<SeatClass[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // ================================================
  // Load seat classes
  // ================================================

  useEffect(() => {
    const loadSeatClasses = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await seatClassesApi.getSeatClasses(
            1,
            100,
          );

        setSeatClasses(
          response.Items ?? [],
        );
      } catch (err) {
        console.error(
          'Failed to load seat classes:',
          err,
        );

        setError(
          'Failed to load cabin classes.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadSeatClasses();
  }, []);

  // ================================================
  // Close dropdown when click outside
  // ================================================

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

  // ================================================
  // Select
  // ================================================

  const handleSelect = (
    seatClass: SeatClass,
  ) => {
    onChange(seatClass);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
    >
      {/* Label */}
{/*
      <label className="block text-[11px] font-medium text-muted uppercase tracking-wide mb-1">
        Cabin Class
      </label>

      Trigger */}

      <button
        type="button"
        disabled={loading}
        onClick={() =>
          setOpen((prev) => !prev)
        }
        className={`
          field-shell
          w-full
          min-h-12
          text-left
          cursor-pointer
          justify-between
          transition-all
          ${
            open
              ? 'border-primary ring-2 ring-primary/20'
              : ''
          }
          ${loading ? 'opacity-70 cursor-wait' : ''}
        `}
      >
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />

              <span className="text-sm text-slate-400">
                Loading...
              </span>
            </div>
          ) : value ? (
            <>
              <div className="text-sm font-semibold text-slate-800 truncate">
                {value.name}
              </div>

              <div className="text-[11px] text-slate-400 uppercase">
                {value.code}
              </div>
            </>
          ) : (
            <div>
              <div className="text-sm font-semibold text-slate-500">
                 Cabin Class
              </div>

              <div className="text-[11px] text-slate-400">
                Choose your preferred class
              </div>
            </div>
          )}
        </div>

        {!loading && (
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
        )}
      </button>

      {/* Error */}

      {error && (
        <div className="absolute left-0 top-full mt-1 text-xs text-red-500">
          {error}
        </div>
      )}

      {/* Dropdown */}

      {open && !loading && (
        <div
          className="
            absolute
            z-9999
            left-0
            right-0
            mt-2
            bg-white
            rounded-md
            border
            border-slate-200
            shadow-xl
            overflow-hidden
          "
        >
          <div className="p-2">
            {seatClasses.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No cabin class available
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Please try again later
                </p>
              </div>
            ) : (
              seatClasses.map((seatClass) => {
                const selected =
                  value?.id === seatClass.id;

                return (
                  <button
                    key={seatClass.id}
                    type="button"
                    onClick={() =>
                      handleSelect(
                        seatClass,
                      )
                    }
                    className={`
                      w-full
                      px-3
                      py-3
                      rounded-md
                      flex
                      items-center
                      justify-between
                      text-left
                      transition-colors
                      ${
                        selected
                          ? 'bg-primary/10'
                          : 'hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="min-w-0">
                      <div
                        className={`
                          text-sm
                          font-semibold
                          truncate
                          ${
                            selected
                              ? 'text-primary'
                              : 'text-slate-700'
                          }
                        `}
                      >
                        {seatClass.name}
                      </div>

                      <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                        {seatClass.code}
                      </div>
                    </div>

                    {selected && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CabinClassPicker;
