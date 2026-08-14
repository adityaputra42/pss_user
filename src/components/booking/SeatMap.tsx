import { useMemo } from 'react';
import clsx from 'clsx';
import { Armchair } from 'lucide-react';
import type { AircraftSeat } from '../../types/api';

interface SeatMapProps {
  seats: AircraftSeat[];
  /** seat_number -> passenger index it's assigned to, for THIS segment only */
  assignedBy: Map<string, number>;
  activePassengerIndex: number;
  passengerLabels: string[];
  onPick: (seat: AircraftSeat) => void;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, assignedBy, activePassengerIndex, passengerLabels, onPick }) => {
  const rows = useMemo(() => {
    const byRow = new Map<number, AircraftSeat[]>();
    for (const s of seats) {
      if (!byRow.has(s.row_number)) byRow.set(s.row_number, []);
      byRow.get(s.row_number)!.push(s);
    }
    return [...byRow.entries()].sort((a, b) => a[0] - b[0]).map(([row, list]) => [
      row,
      list.sort((a, b) => a.seat_letter.localeCompare(b.seat_letter)),
    ] as const);
  }, [seats]);

  if (seats.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">No seat layout published for this aircraft yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1.5 mx-auto py-2">
        {rows.map(([row, list]) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-6 text-[11px] text-muted text-right">{row}</span>
            {list.map((seat) => {
              const takenByIdx = assignedBy.get(seat.seat_number);
              const isMine = takenByIdx === activePassengerIndex;
              const isOther = takenByIdx !== undefined && !isMine;
              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={isOther}
                  title={isOther ? `Taken by ${passengerLabels[takenByIdx!]}` : seat.seat_number}
                  onClick={() => onPick(seat)}
                  className={clsx(
                    'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
                    isMine && 'bg-primary text-white',
                    !isMine && !isOther && 'bg-slate-100 hover:bg-primary-soft text-slate-500',
                    isOther && 'bg-slate-200 text-slate-300 cursor-not-allowed',
                    seat.is_exit_row && !isMine && !isOther && 'ring-1 ring-accent/60',
                  )}
                >
                  <Armchair className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
