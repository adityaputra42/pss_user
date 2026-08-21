import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Search,
  Calendar,
} from 'lucide-react';
import clsx from 'clsx';

import type { Airport } from '../../types/api';

import AirportPicker from './AirportPicker';
import PassengerPicker, {
  type PaxCounts,
} from './PassengerPicker';

import CabinClassPicker from './CabinClassPicker';
import type { SeatClass } from '../../types/api';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import BounceButton from '../animations/BounceButton';

interface SearchFormProps {
  airports: Airport[];
}

const todayISO = () =>
  new Date().toISOString().slice(0, 10);

const SearchForm: React.FC<SearchFormProps> = ({
  airports,
}) => {
  const navigate = useNavigate();

  const setTotalPax = useBookingFlow(
    (s) => s.setTotalPax,
  );

  // --------------------------------------------------
  // Trip
  // --------------------------------------------------

  const [tripType, setTripType] = useState<
    'one_way' | 'round_trip'
  >('one_way');

  // --------------------------------------------------
  // Airport
  // --------------------------------------------------

  const [from, setFrom] =
    useState<Airport | null>(null);

  const [to, setTo] =
    useState<Airport | null>(null);

  // --------------------------------------------------
  // Date
  // --------------------------------------------------

  const [date, setDate] =
    useState(todayISO());

  const [returnDate, setReturnDate] =
    useState('');

  // --------------------------------------------------
  // Passenger
  // --------------------------------------------------

  const [pax, setPax] =
    useState<PaxCounts>({
      adults: 1,
      children: 0,
      infants: 0,
    });

  // --------------------------------------------------
  // Cabin Class
  // --------------------------------------------------

const [cabinClass, setCabinClass] =
  useState<SeatClass | null>(null);
  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  const [error, setError] =
    useState('');

  // --------------------------------------------------
  // Swap airport
  // --------------------------------------------------

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  // --------------------------------------------------
  // Trip type
  // --------------------------------------------------

  const handleTripTypeChange = (
    type: 'one_way' | 'round_trip',
  ) => {
    setTripType(type);

    setError('');

    if (type === 'one_way') {
      setReturnDate('');
    }
  };

  // --------------------------------------------------
  // Departure date
  // --------------------------------------------------

  const handleDateChange = (
    value: string,
  ) => {
    setDate(value);

    setError('');

    // Return date tidak boleh lebih awal
    // dari departure date.
    if (
      returnDate &&
      returnDate < value
    ) {
      setReturnDate('');
    }
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const submit = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    // ----------------------------------------------
    // Validate airport
    // ----------------------------------------------

    if (!from || !to) {
      setError(
        'Choose a departure and a destination.',
      );
      return;
    }

    // ----------------------------------------------
    // Validate same airport
    // ----------------------------------------------

    if (from.id === to.id) {
      setError(
        "Departure and destination can't be the same airport.",
      );
      return;
    }

    // ----------------------------------------------
    // Validate return date
    // ----------------------------------------------

    if (
      tripType === 'round_trip' &&
      !returnDate
    ) {
      setError(
        'Choose a return date, or switch to one-way.',
      );
      return;
    }

    // ----------------------------------------------
    // Validate date
    // ----------------------------------------------

    if (
      returnDate &&
      returnDate < date
    ) {
      setError(
        'Return date cannot be earlier than departure date.',
      );
      return;
    }

    // ----------------------------------------------
    // Validate infant
    // ----------------------------------------------

    if (pax.infants > pax.adults) {
      setError(
        'Each infant must be accompanied by an adult.',
      );
      return;
    }

    setError('');

    // ----------------------------------------------
    // Save passenger state
    // ----------------------------------------------

    setTotalPax(pax);

    // ----------------------------------------------
    // Build query
    // ----------------------------------------------
    const params = new URLSearchParams({
      from: String(from.id),
      to: String(to.id),
      date,
      tripType,
      adults: String(pax.adults),
      children: String(pax.children),
      infants: String(pax.infants),
      seatClassId: String(cabinClass?.id ?? ''),
    });

    // ----------------------------------------------
    // Return date only for round trip
    // ----------------------------------------------

    if (tripType === 'round_trip') {
      params.set(
        'returnDate',
        returnDate,
      );
    }

    // ----------------------------------------------
    // Navigate
    // ----------------------------------------------

    navigate(
      `/flights?${params.toString()}`,
    );
  };

  return (
    <form
      onSubmit={submit}
      className="card"
    >
      {/* ==================================================
          TRIP TYPE
          ================================================== */}

      <div className="flex items-center gap-1.5 px-5 pt-5">
        {(
          [
            'one_way',
            'round_trip',
          ] as const
        ).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              handleTripTypeChange(type)
            }
            className={clsx(
              'px-4 py-1.5 rounded-sm text-xs font-semibold transition-colors',
              tripType === type
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-muted hover:text-ink',
            )}
          >
            {type === 'one_way'
              ? 'One way'
              : 'Round trip'}
          </button>
        ))}
      </div>

      {/* ==================================================
          AIRPORT
          ================================================== */}
<div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-end">
  {/* From */}
  <AirportPicker
    label="From"
    airports={airports}
    value={from}
    onChange={(airport) => {
      setFrom(airport);
      setError('');
    }}
    excludeId={to?.id ?? null}
    placeholder="Departure city"
  />

  {/* Swap */}
  <div className="hidden md:flex items-center justify-center pb-0">
    <button
      type="button"
      onClick={swap}
      className="
        w-10
        h-10
        rounded-full
        border
        border-slate-200
        bg-white
        flex
        items-center
        justify-center
        text-slate-400
        shadow-sm
        hover:text-primary
        hover:border-primary/40
        hover:bg-primary/5
        hover:shadow-md
        transition-all
        duration-200
      "
      title="Swap departure and destination"
      aria-label="Swap departure and destination"
    >
      <ArrowLeftRight className="w-4 h-4" />
    </button>
  </div>

  {/* To */}
  <AirportPicker
    label="To"
    airports={airports}
    value={to}
    onChange={(airport) => {
      setTo(airport);
      setError('');
    }}
    excludeId={from?.id ?? null}
    placeholder="Destination city"
  />
</div>
      {/* ==================================================
          PERFORATION
          ================================================== */}

      <div className="ticket-perforation mx-5" />

      {/* ==================================================
          DATE + PASSENGER + CABIN + SEARCH
          ================================================== */}

      <div
        className="
          p-5
          grid
          grid-cols-1
          md:grid-cols-[1fr_1fr_1fr_1fr_auto]
          gap-2
          items-end
        "
      >
        {/* ==================================================
            DEPARTURE DATE
            ================================================== */}

        <div className="field-shell">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">
              Departure
            </label>

            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) =>
                handleDateChange(
                  e.target.value,
                )
              }
              className="
                input-field
                font-semibold
                w-full
              "
            />
          </div>
        </div>

        {/* ==================================================
            RETURN DATE
            ================================================== */}

        <div
          className={clsx(
            'field-shell',
            tripType === 'one_way' &&
              'opacity-40 pointer-events-none',
          )}
        >
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />

          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">
              Return
            </label>

            <input
              type="date"
              value={returnDate}
              min={date}
              disabled={
                tripType === 'one_way'
              }
              onChange={(e) => {
                setReturnDate(
                  e.target.value,
                );
                setError('');
              }}
              className="
                input-field
                font-semibold
                w-full
              "
            />
          </div>
        </div>

        {/* ==================================================
            PASSENGER
            ================================================== */}

        <PassengerPicker
          value={pax}
          onChange={(value) => {
            setPax(value);
            setError('');
          }}
        />

        {/* ==================================================
            CABIN CLASS
            ================================================== */}

         <CabinClassPicker
          value={cabinClass}
          onChange={setCabinClass}
        />

        {/* ==================================================
            SEARCH
            ================================================== */}

        <BounceButton
          type="submit"
          className="
            btn-primary
            h-full
            min-h-12
            px-6
            md:px-5
          "
        >
          <Search className="w-4 h-4" />

          <span className="md:hidden">
            Search flights
          </span>
        </BounceButton>
      </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (
        <p className="px-5 pb-4 -mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </form>
  );
};

export default SearchForm;
