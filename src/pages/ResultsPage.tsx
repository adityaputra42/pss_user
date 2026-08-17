import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';

import type { FareClass, Itinerary } from '../types/api';
import { flightsApi, fareClassesApi } from '../services/api-services';
import { useBookingFlow } from '../hooks/useBookingFlow';
import ItineraryResultCard from '../components/search/ItineraryResultCard';
import Skeleton from '../components/animations/Skeleton';
import StaggerContainer from '../components/animations/StagerContainer';
import StaggerItem from '../components/animations/StaggerItem';

const ResultsPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setOutbound, setReturn } = useBookingFlow();

  const departureAirportId = Number(params.get('from'));
  const arrivalAirportId = Number(params.get('to'));
  const date = params.get('date') ?? '';
  const tripType = (params.get('tripType') as 'one_way' | 'round_trip') ?? 'one_way';
  const returnDate = params.get('returnDate') ?? undefined;
  const pax = {
    adults: Number(params.get('adults') ?? 1),
    children: Number(params.get('children') ?? 0),
    infants: Number(params.get('infants') ?? 0),
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departure, setDeparture] = useState<Itinerary[]>([]);
  const [returning, setReturning] = useState<Itinerary[]>([]);
  const [fareClasses, setFareClasses] = useState<Map<number, FareClass>>(new Map());

  const [selOutboundIdx, setSelOutboundIdx] = useState<number | null>(null);
  const [selOutboundFare, setSelOutboundFare] = useState<number | null>(null);
  const [selReturnIdx, setSelReturnIdx] = useState<number | null>(null);
  const [selReturnFare, setSelReturnFare] = useState<number | null>(null);

  useEffect(() => {
    if (!departureAirportId || !arrivalAirportId || !date) {
      setError('Missing search details -- go back and search again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      flightsApi.searchFlights({
        departureAirportId,
        arrivalAirportId,
        date,
        totalPax: pax.adults + pax.children + pax.infants,
        tripType,
        returnDate,
      }),
      fareClassesApi.getFareClasses(),
    ])
      .then(([search, fc]) => {
        setDeparture(search.departure ?? []);
        setReturning(search.return ?? []);
        setFareClasses(new Map(fc.Items.map((f) => [f.id, f])));
      })
      .catch((err) => setError(err?.response?.data?.message || 'Couldn\'t load flights. Try searching again.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureAirportId, arrivalAirportId, date, tripType, returnDate]);

  const needsReturn = tripType === 'round_trip';
  const canContinue =
    selOutboundIdx !== null && selOutboundFare !== null && (!needsReturn || (selReturnIdx !== null && selReturnFare !== null));

  const continueToBooking = () => {
    if (selOutboundIdx === null || selOutboundFare === null) return;
    setOutbound(departure[selOutboundIdx], selOutboundFare);
    if (needsReturn && selReturnIdx !== null && selReturnFare !== null) {
      setReturn(returning[selReturnIdx], selReturnFare);
    } else {
      setReturn(null, null);
    }
    navigate('/book');
  };

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-3 py-1.5 mb-4">
        <ChevronLeft className="w-4 h-4" /> Modify search
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">{error}</p>
          <Link to="/" className="btn-primary inline-flex px-5 py-2.5 text-sm">Back to search</Link>
        </div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="font-display font-bold text-xl mb-4">
              Departing flights {needsReturn && <span className="text-muted font-normal text-sm">(1 of 2)</span>}
            </h2>
            {departure.length === 0 ? (
              <p className="text-sm text-muted">No flights found for this route and date.</p>
            ) : (
              <StaggerContainer className="space-y-3">
                {departure.map((it, i) => (
                  <StaggerItem key={i}>
                    <ItineraryResultCard
                      itinerary={it}
                      fareClasses={fareClasses}
                      pax={pax}
                      selectedFareClassId={selOutboundIdx === i ? selOutboundFare : null}
                      onSelect={(fareClassId) => {
                        setSelOutboundIdx(i);
                        setSelOutboundFare(fareClassId);
                      }}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </section>

          {needsReturn && (
            <section className="mb-8">
              <h2 className="font-display font-bold text-xl mb-4">
                Return flights <span className="text-muted font-normal text-sm">(2 of 2)</span>
              </h2>
              {returning.length === 0 ? (
                <p className="text-sm text-muted">No return flights found for this route and date.</p>
              ) : (
                <StaggerContainer className="space-y-3">
                  {returning.map((it, i) => (
                    <StaggerItem key={i}>
                      <ItineraryResultCard
                        itinerary={it}
                        fareClasses={fareClasses}
                        pax={pax}
                        selectedFareClassId={selReturnIdx === i ? selReturnFare : null}
                        onSelect={(fareClassId) => {
                          setSelReturnIdx(i);
                          setSelReturnFare(fareClassId);
                        }}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </section>
          )}

          <div className="sticky bottom-4 flex justify-center">
            <button onClick={continueToBooking} disabled={!canContinue} className="btn-primary px-8 py-3.5 text-sm">
              Continue to passenger details
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsPage;
