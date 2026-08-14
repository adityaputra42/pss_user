import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PlaneTakeoff, ShieldCheck } from 'lucide-react';
import PageTransition from '../animations/PageTransition';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <PlaneTakeoff className="w-4 h-4" />
            </span>
            Aviata
          </Link>
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            No account needed
          </button>
        </div>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200/60 mt-16">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} Aviata. Search, book and pay without an account.</span>
          <span>Payments processed securely via DOKU.</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
