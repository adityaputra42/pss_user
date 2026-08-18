import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogIn, LoaderCircle } from 'lucide-react';
import axios from 'axios';

import { authApi } from '../../services/api-services';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const setSession = useAuth((s) => s.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    setError('');
    setPassword('');
    setSubmitting(false);
    onClose();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authApi.login({ email, password });
      if (!result) {
        setError('Something went wrong. Try again.');
        return;
      }
      setSession(result);
      close();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Wrong email or password.');
        } else if (err.response?.status === 403) {
          setError('This account is locked or inactive.');
        } else {
          setError(err.response?.data?.message || 'Login failed. Try again.');
        }
      } else {
        setError('Login failed. Try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={close} />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="card relative w-full max-w-sm p-6"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-sm flex items-center justify-center text-muted hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="w-10 h-10 rounded-sm bg-primary-soft text-primary flex items-center justify-center mb-4">
              <LogIn className="w-4 h-4" />
            </span>

            <h2 className="font-display font-bold text-xl mb-1">Log in</h2>
            <p className="text-sm text-muted mb-6">
              Optional -- booking works fine as a guest. Logging in just tags bookings you make to your account.
            </p>

            <form onSubmit={submit} className="space-y-3">
              <div className="field-shell">
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field font-medium"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="field-shell">
                <div className="flex-1 min-w-0">
                  <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field font-medium"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button type="submit" disabled={submitting} className="btn-primary w-full h-11">
                {submitting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : 'Log in'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
