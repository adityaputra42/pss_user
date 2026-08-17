import { useEffect, useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { CheckCircle2, Copy, Loader2, Ticket, AlertTriangle } from 'lucide-react';

import type { CreatePaymentResult } from '../types/api';
import { paymentsApi } from '../services/api-services';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { formatMoney } from '../utils/format';
import ScaleIn from '../components/animations/ScaleIn';
import Pulse from '../components/animations/Pulse';

const POLL_INTERVAL_MS = 5000;

const ConfirmationPage: React.FC = () => {
  const location = useLocation();
  const payment = (location.state as { payment: CreatePaymentResult | null } | undefined)?.payment ?? null;
  const pnr = useBookingFlow((s) => s.pnr);
  const reset = useBookingFlow((s) => s.reset);

  const [status, setStatus] = useState<string>('PENDING');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pnr) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const latest = await paymentsApi.getLatestPaymentByPnr(pnr.PNRID);
        if (!cancelled && latest) setStatus(latest.Status);
      } catch {
        // no payment yet / transient -- keep polling silently
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [pnr]);

  if (!pnr || !payment) return <Navigate to="/" replace />;

  const copyCode = () => {
    navigator.clipboard.writeText(pnr.BookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isPaid = status === 'PAID';

  return (
    <div className="max-w-lg mx-auto px-5 md:px-8 py-10">
      <ScaleIn>
      <div className="card p-6 text-center">
        {isPaid ? (
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        ) : (
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <Pulse />
          </div>
        )}
        <h1 className="font-display font-bold text-2xl mb-1">
          {isPaid ? 'You\'re booked!' : 'Complete your payment'}
        </h1>
        <p className="text-sm text-muted mb-6">
          {isPaid
            ? 'Your e-ticket is issued. Save your booking code below -- it\'s the only way to find this trip again.'
            : 'Pay via the virtual account below. This page updates automatically once payment is received.'}
        </p>

        <div className="bg-slate-50 rounded-md p-4 mb-4">
          <div className="text-[11px] text-muted uppercase tracking-wide mb-1">Booking code</div>
          <button onClick={copyCode} className="font-display font-bold text-2xl tracking-widest inline-flex items-center gap-2">
            {pnr.BookingCode}
            <Copy className="w-4 h-4 text-muted" />
          </button>
          {copied && <div className="text-[11px] text-emerald-600 mt-1">Copied</div>}
        </div>

        {!isPaid && (
          <div className="text-left bg-primary-soft rounded-md p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Virtual account</span>
              <span className="font-semibold">{payment.virtual_account_no || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Amount</span>
              <span className="font-semibold">{formatMoney(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Expires</span>
              <span className="font-semibold">{new Date(payment.expired_at).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-left text-xs text-muted bg-amber-50 border border-amber-100 rounded-sm p-3 mb-6">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          No account was created, so this page and your booking code are the only record of this trip -- there's
          nowhere else to look it up. Screenshot or write down the code above before you leave.
        </div>

        <Link
          to="/"
          onClick={() => isPaid && reset()}
          className="btn-secondary w-full py-3 text-sm inline-flex justify-center"
        >
          <Ticket className="w-4 h-4" /> {isPaid ? 'Book another flight' : 'Back to home'}
        </Link>
      </div>
      </ScaleIn>
    </div>
  );
};

export default ConfirmationPage;
