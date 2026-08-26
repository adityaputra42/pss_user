import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, AlertCircle, Wallet, CreditCard, PlusCircle, Ticket } from 'lucide-react';

import type { Itinerary, PassengerFormInput, SelectedAncillary } from '../../types/api';
import { paymentsApi, walletApi } from '../../services/api-services';
import { formatMoney } from '../../utils/format';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import { useAuth } from '../../hooks/useAuth';
import BounceButton from '../animations/BounceButton';

interface PaymentStepProps {
  outbound: Itinerary;
  outboundFareClassId: number;
  ret: Itinerary | null;
  returnFareClassId: number | null;
  passengers: PassengerFormInput[];
  ancillarySelections: SelectedAncillary[];
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  outbound,
  outboundFareClassId,
  ret,
  returnFareClassId,
  passengers,
  ancillarySelections,
}) => {
  const navigate = useNavigate();
  const pnr = useBookingFlow((s) => s.pnr);
  const reset = useBookingFlow((s) => s.reset);

  const user = useAuth((s) => s.user);
  const [paymentMethod, setPaymentMethod] = useState<'DOKU_VA' | 'BALANCE'>('DOKU_VA');
  const [balance, setBalance] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  useEffect(() => {
    if (!user) return;
    walletApi.getBalance().then((b) => setBalance(b?.balance ?? '0')).catch(() => setBalance(null));
  }, [user]);

  useEffect(() => {
    if (!pnr) navigate('/', { replace: true });
  }, [pnr, navigate]);

  const outboundFare = outbound.fares.find((f) => f.fare_class_id === outboundFareClassId)!;
  const returnFare = ret && returnFareClassId ? ret.fares.find((f) => f.fare_class_id === returnFareClassId) : null;

  const fareTotal = (prices: Record<string, string>) =>
    passengers.reduce((sum, p) => sum + Number(prices[p.passenger_type] ?? 0), 0);

  const ticketTotal = fareTotal(outboundFare.prices) + (returnFare ? fareTotal(returnFare.prices) : 0);
  const ancillaryTotal = ancillarySelections.reduce((sum, s) => sum + Number(s.unitPrice) * s.quantity, 0);
  const grandTotal = ticketTotal + ancillaryTotal;
  const hasEnoughBalance = balance !== null && Number(balance) >= grandTotal;

  if (!pnr) return null;

  const pay = async () => {
    setSubmitting(true);
    setError('');
    setInsufficientBalance(false);
    try {
      const payment = await paymentsApi.createPayment({ pnr_id: pnr.PNRID, payment_method: paymentMethod });
      navigate('/confirmation', { state: { payment } });
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Something went wrong -- please try again.';

      if (status === 402) {
        setInsufficientBalance(true);
        setPaymentMethod('DOKU_VA');
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const abandonAndGoHome = () => {
    const ok = window.confirm(
      `Leave without paying? Booking ${pnr.BookingCode} stays on hold until it expires, but you won't be able to return to it here unless you saved the code.`,
    );
    if (!ok) return;
    reset();
    navigate('/');
  };

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="font-display font-bold mb-4">Your booking</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ticket className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="text-xs text-muted">Booking code</div>
              <div className="text-sm font-display font-bold tracking-widest">{pnr.BookingCode}</div>
            </div>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-sm bg-amber-50 text-amber-600 border border-amber-100">
            {pnr.Status}
          </span>
        </div>
        <p className="text-xs text-muted mt-3">
          Your seats are held until {new Date(pnr.ExpiresAt).toLocaleString()}. Complete payment before then.
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
          <span className="font-display font-bold">Amount due</span>
          <span className="font-display font-bold text-lg text-primary">{formatMoney(grandTotal, outboundFare.currency)}</span>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-bold mb-3">Pay with</h3>

        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('DOKU_VA')}
              className={`flex items-start gap-3 p-4 rounded-md border text-left transition-colors ${
                paymentMethod === 'DOKU_VA' ? 'border-primary bg-primary-soft' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Virtual account</div>
                <div className="text-xs text-muted mt-0.5">Pay via bank transfer (DOKU)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => hasEnoughBalance && setPaymentMethod('BALANCE')}
              disabled={!hasEnoughBalance}
              className={`flex items-start gap-3 p-4 rounded-md border text-left transition-colors ${
                paymentMethod === 'BALANCE' ? 'border-primary bg-primary-soft' : 'border-slate-200 hover:border-slate-300'
              } ${!hasEnoughBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Wallet className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Wallet balance</div>
                <div className="text-xs text-muted mt-0.5">
                  {balance === null ? 'Loading…' : `${formatMoney(balance)} available`}
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-md border border-primary bg-primary-soft text-left">
            <CreditCard className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold">Virtual account</div>
              <div className="text-xs text-muted mt-0.5">Pay via bank transfer (DOKU)</div>
            </div>
          </div>
        )}

        {user && !hasEnoughBalance && balance !== null && (
          <p className="text-xs text-muted mt-3 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" />
            Not enough balance to cover {formatMoney(grandTotal)}.{' '}
            <Link to="/wallet" className="text-primary font-semibold underline">Top up first</Link>, or pay via virtual account.
          </p>
        )}
        {!user && (
          <p className="text-xs text-muted mt-3">
            <Link to="/wallet" className="text-primary font-semibold underline">Log in</Link> to pay from your wallet balance instead.
          </p>
        )}
      </div>

      {error && (
        <div
          className="rounded-md border border-red-200 p-4 bg-red-50/60 flex gap-2.5"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {insufficientBalance ? (
              <>
                Your balance wasn't enough to cover this payment, so your booking is still on hold, unpaid.{' '}
                <Link to="/wallet" className="underline font-semibold">Top up</Link>, or press &ldquo;Pay now&rdquo;
                again to pay via virtual account instead -- your seats are still held.
              </>
            ) : (
              error
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={abandonAndGoHome} disabled={submitting} className="btn-secondary px-6 py-3 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to home
        </button>
        <BounceButton onClick={pay} disabled={submitting} className="btn-primary px-8 py-3 text-sm">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Processing…' : 'Pay now'}
        </BounceButton>
      </div>
    </div>
  );
};

export default PaymentStep;
