import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  Plus,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  CheckCircle2,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { walletApi } from '../services/api-services';
import type { TopupResult, WalletTransaction } from '../types/api';
import { formatMoney } from '../utils/format';
import ScaleIn from '../components/animations/ScaleIn';
import FadeIn from '../components/animations/FadeIn';
import BounceButton from '../components/animations/BounceButton';

const POLL_INTERVAL_MS = 5000;
const PAGE_LIMIT = 10;

// Same icon/label pairing on both sides -- keep in sync if the backend
// ever adds a wallet_transactions.type value (see wallet's migration
// 000002's CHECK constraint for the source of truth).
const typeMeta: Record<string, { label: string; icon: React.ReactNode; positive: boolean }> = {
  TOPUP: { label: 'Top up', icon: <ArrowDownCircle className="w-4 h-4 text-emerald-500" />, positive: true },
  REFUND_CREDIT: { label: 'Refund', icon: <ArrowDownCircle className="w-4 h-4 text-emerald-500" />, positive: true },
  PAYMENT_DEBIT: { label: 'Payment', icon: <ArrowUpCircle className="w-4 h-4 text-rose-500" />, positive: false },
  ADJUSTMENT: { label: 'Adjustment', icon: <ArrowUpCircle className="w-4 h-4 text-slate-400" />, positive: false },
};

const WalletPage: React.FC = () => {
  const user = useAuth((s) => s.user);

  const [balance, setBalance] = useState<{ balance: string; currency: string } | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [txLoading, setTxLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [topupError, setTopupError] = useState('');
  const [activeTopup, setActiveTopup] = useState<TopupResult | null>(null);
  const [topupStatus, setTopupStatus] = useState<string>('PENDING');
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const result = await walletApi.getBalance();
      setBalance(result);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (p: number) => {
    setTxLoading(true);
    try {
      const result = await walletApi.listTransactions(p, PAGE_LIMIT);
      setTransactions(result?.items ?? []);
      setTotal(result?.total ?? 0);
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadBalance();
  }, [user, loadBalance]);

  useEffect(() => {
    if (!user) return;
    loadTransactions(page);
  }, [user, page, loadTransactions]);

  useEffect(() => {
    if (!activeTopup) return;
    const poll = async () => {
      try {
        const status = await walletApi.getTopupStatus(activeTopup.topup_code);
        if (!status) return;
        setTopupStatus(status.status);
        if (status.status === 'PAID' || status.status === 'FAILED' || status.status === 'EXPIRED') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (status.status === 'PAID') {
            loadBalance();
            loadTransactions(1);
            setPage(1);
          }
        }
      } catch {
      }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeTopup, loadBalance, loadTransactions]);

  if (!user) return <Navigate to="/" replace />;

  const submitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupError('');
    const value = Number(amount);
    if (!value || value <= 0) {
      setTopupError('Enter an amount greater than zero.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await walletApi.topup({ amount: value });
      if (!result) throw new Error('Something went wrong.');
      setActiveTopup(result);
      setTopupStatus('PENDING');
      setAmount('');
    } catch (err: any) {
      setTopupError(err?.response?.data?.message || err?.message || 'Could not start top up.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyVA = () => {
    if (!activeTopup) return;
    navigator.clipboard.writeText(activeTopup.virtual_account_no);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-10 space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">My wallet</h1>
        <p className="text-sm text-muted mt-1">Top up your balance and use it to pay for bookings instantly -- no bank redirect needed.</p>
      </div>

      <ScaleIn>
        <div className="card p-6 bg-primary text-white flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-white/70 mb-1">Available balance</div>
            <div className="font-display font-bold text-3xl">
              {balanceLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatMoney(balance?.balance ?? '0', balance?.currency ?? 'IDR')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <WalletIcon className="w-6 h-6" />
          </div>
        </div>
      </ScaleIn>

      {/* ---- Top up ---- */}
      <div className="card p-6">
        <h2 className="font-display font-bold mb-4">Top up</h2>

        {activeTopup ? (
          <FadeIn>
            <div className="bg-primary-soft rounded-md p-4 space-y-3">
              {topupStatus === 'PAID' ? (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Top up received -- your balance has been updated.
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Virtual account</span>
                    <button onClick={copyVA} className="font-semibold inline-flex items-center gap-1.5">
                      {activeTopup.virtual_account_no} <Copy className="w-3.5 h-3.5 text-muted" />
                    </button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Amount</span>
                    <span className="font-semibold">{formatMoney(activeTopup.amount, activeTopup.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Expires</span>
                    <span className="font-semibold">{new Date(activeTopup.expired_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted pt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Waiting for payment -- this updates automatically.
                    {copied && <span className="text-emerald-600 font-medium ml-auto">Copied</span>}
                  </div>
                </>
              )}
              <button
                onClick={() => setActiveTopup(null)}
                className="btn-secondary w-full py-2.5 text-sm mt-2"
              >
                {topupStatus === 'PAID' ? 'Top up again' : 'Start a different top up'}
              </button>
            </div>
          </FadeIn>
        ) : (
          <form onSubmit={submitTopup} className="space-y-3">
            <div className="field-shell">
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Amount (IDR)</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field font-medium"
                  placeholder="100000"
                />
              </div>
            </div>
            {topupError && <p className="text-sm text-red-500">{topupError}</p>}
            <BounceButton type="submit" disabled={submitting} className="btn-primary w-full h-11">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Top up via Virtual Account</>}
            </BounceButton>
          </form>
        )}
      </div>

      {/* ---- Transaction history ---- */}
      <div className="card p-6">
        <h2 className="font-display font-bold mb-4">Transaction history</h2>

        {txLoading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted text-center py-10">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((t) => {
              const meta = typeMeta[t.type] ?? { label: t.type, icon: null, positive: true };
              return (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {meta.icon}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{t.description || meta.label}</div>
                      <div className="text-xs text-muted">{new Date(t.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold shrink-0 ${meta.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {meta.positive ? '+' : '-'}{formatMoney(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
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

export default WalletPage;
