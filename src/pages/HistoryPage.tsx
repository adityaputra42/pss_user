import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Copy,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { bookingsApi } from '../services/api-services';
import type { PNRSummary } from '../types/api';
import { formatMoney } from '../utils/format';
import FadeIn from '../components/animations/FadeIn';

const PAGE_LIMIT = 10;

const statusMeta: Record<string, { label: string; className: string }> = {
  HOLD: { label: 'On hold', className: 'bg-amber-100 text-amber-700' },
  BOOKED: { label: 'Booked', className: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-200 text-slate-500' },
  EXPIRED: { label: 'Expired', className: 'bg-rose-100 text-rose-600' },
};

const paymentStatusMeta: Record<string, { label: string; className: string }> = {
  PAID: { label: 'Paid', className: 'text-emerald-600' },
  PENDING: { label: 'Payment pending', className: 'text-amber-600' },
  FAILED: { label: 'Payment failed', className: 'text-rose-600' },
  EXPIRED: { label: 'Payment expired', className: 'text-rose-600' },
  UNPAID: { label: 'Unpaid', className: 'text-muted' },
};

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'HOLD', label: 'On hold' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Expired' },
];

const HistoryPage: React.FC = () => {
  const user = useAuth((s) => s.user);

  const [items, setItems] = useState<PNRSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadHistory = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await bookingsApi.listMine({ page: p, limit: PAGE_LIMIT, status: s });
      setItems(result?.items ?? []);
      setTotal(result?.total ?? 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't load your booking history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadHistory(page, status);
  }, [user, page, status, loadHistory]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1500);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-xl mb-2">Log in to see your history</h1>
        <p className="text-sm text-muted mb-6">Your past and upcoming bookings will show up here once you're logged in.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5">
          <LogIn className="w-4 h-4" /> Go to home to log in
        </Link>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Booking history</h1>
        <p className="text-sm text-muted mt-1">Every PNR created under your account, newest first.</p>
      </div>

      {/* ---- Status filter ---- */}
      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              status === f.value ? 'bg-primary text-white' : 'bg-slate-100 text-muted hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-10">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((pnr) => {
              const sMeta = statusMeta[pnr.status] ?? { label: pnr.status, className: 'bg-slate-100 text-slate-500' };
              const pMeta = paymentStatusMeta[pnr.payment_status] ?? { label: pnr.payment_status, className: 'text-muted' };
              return (
                <FadeIn key={pnr.id}>
                  <div className="flex items-center justify-between gap-3 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyCode(pnr.booking_code)}
                          className="text-sm font-semibold font-mono tracking-wide inline-flex items-center gap-1.5"
                          title="Copy booking code"
                        >
                          {pnr.booking_code}
                          {copiedCode === pnr.booking_code ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted" />
                          )}
                        </button>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${sMeta.className}`}>
                          {sMeta.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {new Date(pnr.created_at).toLocaleString()}
                        {pnr.expires_at && pnr.status === 'HOLD' && (
                          <> &middot; expires {new Date(pnr.expires_at).toLocaleString()}</>
                        )}
                      </div>
                      <div className={`text-xs font-medium mt-0.5 ${pMeta.className}`}>{pMeta.label}</div>
                    </div>
                    <div className="text-sm font-semibold shrink-0">{formatMoney(pnr.total_amount, pnr.currency)}</div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-muted">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-secondary px-3 py-2 text-xs disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <Link to="/" className="text-sm text-muted hover:text-primary inline-block">
        ← Back to home
      </Link>
    </div>
  );
};

export default HistoryPage;
