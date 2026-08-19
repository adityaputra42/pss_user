import { useEffect, useState } from 'react';
import { Search, ArmchairIcon, CreditCard, Ticket } from 'lucide-react';

import type { Airport } from '../types/api';
import { airportsApi } from '../services/api-services';
import SearchForm from '../components/search/SearchForm';
import FadeIn from '../components/animations/FadeIn';
import StaggerContainer from '../components/animations/StagerContainer';
import StaggerItem from '../components/animations/StaggerItem';
import Skeleton from '../components/animations/Skeleton';

const HERO_IMAGE ="/takeoff.webp"
  // 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80';

const steps = [
  { icon: Search, title: 'Search', desc: 'Compare fares across every fare class for your route and date.' },
  { icon: ArmchairIcon, title: 'Pick your seat', desc: 'See the real aircraft layout and choose where you sit.' },
  { icon: CreditCard, title: 'Pay', desc: 'Settle up by virtual account or QRIS -- no account required.' },
  { icon: Ticket, title: 'Get your e-ticket', desc: 'Your booking code and itinerary, ready right after payment.' },
];

const HomePage: React.FC = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    airportsApi
      .getAirports()
      .then((r) => setAirports(r.Items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>

      <section className="relative -mt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Airplane wing above the clouds at golden hour"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-ink/5 via-ink/25 to-bg" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-32 md:pt-40 pb-36 md:pb-44 text-center">
          <FadeIn duration={0.5}>
            <p className="font-display text-xs font-semibold tracking-[0.2em] text-white/85 uppercase mb-4">
              Ready for take-off
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-white max-w-3xl mx-auto">
              Book a flight without making an account
            </h1>
            <p className="text-white/80 mt-5 max-w-xl mx-auto">
              Search real fares, choose your seat and pay -- start to finish, in one visit. Nothing to sign up for,
              nothing saved after you close the tab.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Search form, stacked over the header image, anchored bottom-center */}
      <section id="search" className="max-w-6xl mx-auto px-5 md:px-8 -mt-24 md:-mt-28 relative z-20">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-md" />
        ) : airports.length === 0 ? (
          <div className="card p-10 text-center text-muted text-sm">
            Couldn't load the airport list. Check your connection and refresh.
          </div>
        ) : (
          <SearchForm airports={airports} />
        )}
      </section>

      <section id="how-it-works" className="max-w-6xl mx-auto px-5 md:px-8 py-20">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-2">How booking works</h2>
        <p className="text-muted text-center mb-10">Four steps, in order -- no detours through a login screen.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerContainer className="contents">
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="card p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-sm bg-primary-soft text-primary flex items-center justify-center">
                      <s.icon className="w-4 h-4" />
                    </span>
                    <span className="font-display text-xs font-bold text-slate-300">0{i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
