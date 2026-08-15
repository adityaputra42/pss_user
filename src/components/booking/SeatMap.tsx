import { Fragment, useMemo } from 'react';
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

const KNOWN_CLUSTERS: Record<number, number[]> = {
  4: [2, 2],
  6: [3, 3],
  8: [3, 2, 3],
  9: [3, 3, 3],
};

const clustersForWidth = (width: number): number[] => {
  if (KNOWN_CLUSTERS[width]) return KNOWN_CLUSTERS[width];
  if (width <= 1) return [width];
  const left = Math.ceil(width / 2);
  return [left, width - left];
};

/** Column indices right after which an aisle gap should render (0-based, exclusive of the last column). */
const aisleGapsAfter = (clusters: number[]): Set<number> => {
  const gaps = new Set<number>();
  let idx = 0;
  for (const size of clusters.slice(0, -1)) {
    idx += size;
    gaps.add(idx - 1);
  }
  return gaps;
};

const SeatMap: React.FC<SeatMapProps> = ({ seats, assignedBy, activePassengerIndex, passengerLabels, onPick }) => {
  const { rowNumbers, letters, gapAfter, seatByKey } = useMemo(() => {
    const rowSet = new Set<number>();
    const letterSet = new Set<string>();
    const byKey = new Map<string, AircraftSeat>();
    for (const s of seats) {
      rowSet.add(s.row_number);
      letterSet.add(s.seat_letter);
      byKey.set(`${s.row_number}-${s.seat_letter}`, s);
    }
    const sortedRows = [...rowSet].sort((a, b) => a - b);
    const sortedLetters = [...letterSet].sort();
    const clusters = clustersForWidth(sortedLetters.length);
    return { rowNumbers: sortedRows, letters: sortedLetters, gapAfter: aisleGapsAfter(clusters), seatByKey: byKey };
  }, [seats]);

  if (seats.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">No seat layout published for this aircraft yet.</p>;
  }

  const renderCell = (row: number, letterIdx: number) => {
    const letter = letters[letterIdx];
    const seat = seatByKey.get(`${row}-${letter}`);
    if (!seat) return <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />;

    const takenByIdx = assignedBy.get(seat.seat_number);
    const isMine = takenByIdx === activePassengerIndex;
    const isOther = takenByIdx !== undefined && !isMine;

    return (
      <button
        type="button"
        disabled={isOther}
        title={isOther ? `Taken by ${passengerLabels[takenByIdx!]}` : seat.seat_number}
        onClick={() => onPick(seat)}
        className={clsx(
          'w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors shrink-0',
          isMine && 'bg-primary text-white',
          !isMine && !isOther && 'bg-slate-100 hover:bg-primary-soft text-slate-500',
          isOther && 'bg-slate-200 text-slate-300 cursor-not-allowed',
          seat.is_exit_row && !isMine && !isOther && 'ring-1 ring-accent/60',
        )}
      >
        <Armchair className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 sm:gap-1.5 mx-auto py-2">
        {/* column headers: A, B, C ... with aisle gaps at the cluster boundaries */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-5 sm:w-6 shrink-0" />
          {letters.map((letter, i) => (
            <Fragment key={letter}>
              <span className="w-7 sm:w-8 shrink-0 text-center text-[10px] sm:text-[11px] font-semibold text-muted">
                {letter}
              </span>
              {gapAfter.has(i) && <span className="w-3 sm:w-4 shrink-0" />}
            </Fragment>
          ))}
        </div>

        {rowNumbers.map((row) => (
          <div key={row} className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-5 sm:w-6 shrink-0 text-[10px] sm:text-[11px] text-muted text-right">{row}</span>
            {letters.map((_, i) => (
              <Fragment key={i}>
                {renderCell(row, i)}
                {gapAfter.has(i) && <span className="w-3 sm:w-4 shrink-0" />}
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatMap;
