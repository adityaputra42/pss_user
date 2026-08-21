import { useEffect, useState } from 'react';

import { Search, ArmchairIcon, CreditCard, Ticket } from 'lucide-react';

import type { Airport } from '../types/api';

import { airportsApi } from '../services/api-services';

import SearchForm from '../components/search/SearchForm';

import FadeIn from '../components/animations/FadeIn';

import StaggerContainer from '../components/animations/StagerContainer';

import StaggerItem from '../components/animations/StaggerItem';

import Skeleton from '../components/animations/Skeleton';

const HERO_IMAGE = '/hero.jpg';

const steps = [
  {
    icon: Search,
    title: 'Search',
    desc: 'Compare fares across every fare class for your route and date.',
  },
  {
    icon: ArmchairIcon,
    title: 'Pick your seat',
    desc: 'See the real aircraft layout and choose where you sit.',
  },
  {
    icon: CreditCard,
    title: 'Pay',
    desc: 'Settle up by virtual account or QRIS -- no account required.',
  },
  {
    icon: Ticket,
    title: 'Get your e-ticket',
    desc: 'Your booking code and itinerary, ready right after payment.',
  },
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
      {/* Hero */}
      <section className="relative -mt-16 min-h-155 md:min-h-180 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Airplane wing above the clouds at golden hour"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-b from-ink/5 via-ink/25 to-bg" />
        </div>

        {/* Hero Content */}

        <div className="relative z-10 max-w-7xl mx-auto min-h-155 md:min-h-180 px-5 md:px-8 flex items-center justify-center text-center">
          <FadeIn duration={0.5}>
            <div className="max-w-4xl mx-auto -mt-10 md:-mt-16">
              <p className="font-display text-xs md:text-sm font-semibold tracking-[0.2em] text-white/85 uppercase mb-5">
                Your journey starts here
              </p>

              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white max-w-4xl mx-auto">
                Fly further.
                <br />
                Travel smarter.
              </h1>

              <p className="text-white/85 mt-6 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Find the right flight, choose your seat, and book your journey
                with ease. Everything you need for a smoother trip, all in one place.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Search Form */}
      <section
        id="search"
        className="max-w-6xl mx-auto px-5 md:px-8 -mt-24 md:-mt-32 relative z-20"
      >
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

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-5 md:px-8 py-20"
      >
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center mb-2">
          How booking works
        </h2>

        <p className="text-muted text-center mb-10">
          Four steps, in order -- no detours through a login screen.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerContainer className="contents">
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="card p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-9 h-9 rounded-sm bg-primary-soft text-primary flex items-center justify-center">
                      <s.icon className="w-4 h-4" />
                    </span>

                    <span className="font-display text-xs font-bold text-slate-300">
                      0{i + 1}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm mb-1">
                    {s.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">
                    {s.desc}
                  </p>
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
