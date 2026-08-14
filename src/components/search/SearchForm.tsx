import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Search, Calendar } from 'lucide-react';
import clsx from 'clsx';

import type { Airport } from '../../types/api';
import AirportPicker from './AirportPicker';
import PassengerPicker, { type PaxCounts } from './PassengerPicker';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import BounceButton from '../animations/BounceButton';

interface SearchFormProps {
  airports: Airport[];
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const SearchForm: React.FC<SearchFormProps> = ({ airports }) => {
  const navigate = useNavigate();
  const setTotalPax = useBookingFlow((s) => s.setTotalPax);

  const [tripType, setTripType] = useState<'one_way' | 'round_trip'>('one_way');
  const [from, setFrom] = useState<Airport | null>(null);
  const [to, setTo] = useState<Airport | null>(null);
  const [date, setDate] = useState(todayISO());
  const [returnDate, setReturnDate] = useState('');
  const [pax, setPax] = useState<PaxCounts>({ adults: 1, children: 0, infants: 0 });
  const [error, setError] = useState('');

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return setError('Choose a departure and a destination.');
    if (from.id === to.id) return setError('Departure and destination can\'t be the same airport.');
    if (tripType === 'round_trip' && !returnDate) return setError('Choose a return date, or switch to one-way.');
    setError('');
    setTotalPax(pax);

    const params = new URLSearchParams({
      from: String(from.id),
      to: String(to.id),
      date,
      tripType,
      adults: String(pax.adults),
      children: String(pax.children),
      infants: String(pax.infants),
    });
    if (tripType === 'round_trip') params.set('returnDate', returnDate);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="card overflow-hidden">
      {/* trip type tabs -- the ticket's "class of service" strip */}
      <div className="flex items-center gap-1.5 px-5 pt-5">
        {(['one_way', 'round_trip'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-colors',
              tripType === t ? 'bg-primary text-white' : 'bg-slate-100 text-muted hover:text-ink',
            )}
          >
            {t === 'one_way' ? 'One way' : 'Round trip'}
          </button>
        ))}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <AirportPicker label="From" airports={airports} value={from} onChange={setFrom} placeholder="Departure city" />
        <button
          type="button"
          onClick={swap}
          className="hidden md:flex mx-auto w-9 h-9 rounded-full border border-slate-200 items-center justify-center text-slate-400 hover:text-primary hover:border-primary/40 transition-colors"
          title="Swap"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <AirportPicker label="To" airports={airports} value={to} onChange={setTo} placeholder="Destination city" />
      </div>

      {/* perforation between "route" and "date + pax + search" halves */}
      <div className="ticket-perforation mx-5" />

      <div className="p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
        <div className="field-shell">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Departure</label>
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="input-field font-semibold"
            />
          </div>
        </div>

        <div className={clsx('field-shell', tripType === 'one_way' && 'opacity-40 pointer-events-none')}>
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1">
            <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Return</label>
            <input
              type="date"
              value={returnDate}
              min={date}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === 'one_way'}
              className="input-field font-semibold"
            />
          </div>
        </div>

        <PassengerPicker value={pax} onChange={setPax} />

        <BounceButton type="submit" className="btn-primary h-full min-h-12 px-6 md:px-5">
          <Search className="w-4 h-4" />
          <span className="md:hidden">Search flights</span>
        </BounceButton>
      </div>

      {error && <p className="px-5 pb-4 -mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
};

export default SearchForm;
