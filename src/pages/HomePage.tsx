import { useEffect, useState } from 'react';
import { Search, ArmchairIcon, CreditCard, Ticket } from 'lucide-react';

import type { Airport } from '../types/api';
import { airportsApi } from '../services/api-services';
import SearchForm from '../components/search/SearchForm';
import HeroPlane from '../components/search/HeroPlane';
import FadeIn from '../components/animations/FadeIn';
import Floating from '../components/animations/Floating';
import StaggerContainer from '../components/animations/StagerContainer';
import StaggerItem from '../components/animations/StaggerItem';
import Skeleton from '../components/animations/Skeleton';

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
      <section className="max-w-6xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-10 text-center">
        <FadeIn duration={0.5}>
          <p className="font-display text-xs font-semibold tracking-[0.2em] text-primary uppercase mb-4">
            Ready for take-off
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-[1.05] tracking-tight text-ink max-w-3xl mx-auto">
            Book a flight without making an account
          </h1>
          <p className="text-muted mt-5 max-w-xl mx-auto">
            Search real fares, choose your seat and pay -- start to finish, in one visit. Nothing to sign up for,
            nothing saved after you close the tab.
          </p>
        </FadeIn>
      </section>

      <div className="max-w-3xl mx-auto -mt-4 mb-2 px-5 md:px-8">
        <Floating>
          <HeroPlane />
        </Floating>
      </div>

      <section className="max-w-5xl mx-auto px-5 md:px-8 -mt-6 relative z-10">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : airports.length === 0 ? (
          <div className="card p-10 text-center text-muted text-sm">
            Couldn't load the airport list. Check your connection and refresh.
          </div>
        ) : (
          <SearchForm airports={airports} />
        )}
      </section>

      <section className="max-w-5xl mx-auto px-5 md:px-8 py-20">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-2">How booking works</h2>
        <p className="text-muted text-center mb-10">Four steps, in order -- no detours through a login screen.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerContainer className="contents">
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="card p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center">
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
