import type { ContactInput, PassengerFormInput, PassengerType } from '../../types/api';
import { PASSENGER_TYPE_LABELS } from '../../types/api';

interface PassengerStepProps {
  passengers: PassengerFormInput[];
  contact: ContactInput;
  onChangePassenger: (index: number, patch: Partial<PassengerFormInput>) => void;
  onChangeContact: (patch: Partial<ContactInput>) => void;
  onNext: () => void;
}

const genders: { code: string; label: string }[] = [
  { code: 'M', label: 'Male' },
  { code: 'F', label: 'Female' },
];

const PassengerStep: React.FC<PassengerStepProps> = ({ passengers, contact, onChangePassenger, onChangeContact, onNext }) => {
  const isComplete =
    contact.full_name.trim() &&
    contact.phone.trim() &&
    contact.email?.trim() && // email isn't marked required by the schema, but payment fails server-side without one (DOKU needs it to open a VA), so it's required here
    passengers.every((p) => p.first_name.trim() && p.birth_date && p.gender);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="font-display font-bold mb-1">Contact details</h3>
        <p className="text-xs text-muted mb-4">We'll send your booking code and payment link here -- this is also how you'll find your booking again, since nothing is saved to an account.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="field-shell">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Full name</label>
              <input
                className="input-field font-medium"
                value={contact.full_name}
                onChange={(e) => onChangeContact({ full_name: e.target.value })}
                placeholder="As on your ID"
              />
            </div>
          </div>
          <div className="field-shell">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Email</label>
              <input
                type="email"
                className="input-field font-medium"
                value={contact.email ?? ''}
                onChange={(e) => onChangeContact({ email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="field-shell">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Phone</label>
              <input
                className="input-field font-medium"
                value={contact.phone}
                onChange={(e) => onChangeContact({ phone: e.target.value })}
                placeholder="+62..."
              />
            </div>
          </div>
        </div>
      </div>

      {passengers.map((p, i) => (
        <div key={i} className="card p-5">
          <h3 className="font-display font-bold mb-1">
            Passenger {i + 1} <span className="font-normal text-muted text-sm">— {PASSENGER_TYPE_LABELS[p.passenger_type as PassengerType]}</span>
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="field-shell">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">First name</label>
                <input
                  className="input-field font-medium"
                  value={p.first_name}
                  onChange={(e) => onChangePassenger(i, { first_name: e.target.value })}
                />
              </div>
            </div>
            <div className="field-shell">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Last name</label>
                <input
                  className="input-field font-medium"
                  value={p.last_name ?? ''}
                  onChange={(e) => onChangePassenger(i, { last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="field-shell">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Date of birth</label>
                <input
                  type="date"
                  className="input-field font-medium"
                  value={p.birth_date ?? ''}
                  onChange={(e) => onChangePassenger(i, { birth_date: e.target.value })}
                />
              </div>
            </div>
            <div className="field-shell">
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-muted uppercase tracking-wide">Gender</label>
                <select
                  className="input-field font-medium"
                  value={p.gender ?? ''}
                  onChange={(e) => onChangePassenger(i, { gender: e.target.value })}
                >
                  <option value="">Select</option>
                  {genders.map((g) => (
                    <option key={g.code} value={g.code}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!isComplete} className="btn-primary px-8 py-3 text-sm">
          Continue to seat selection
        </button>
      </div>
    </div>
  );
};

export default PassengerStep;
