import { CircleCheck } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { NavLink, useSearchParams, useParams } from 'react-router-dom';
import { useStore, isSlotBooked, dateHasAvailability, getAvailableSlots } from '../../lib/store';
import { Button } from '../../components/ui/Button';
import { formatUGX, formatTime, formatPhone, isValidUgandanPhone } from '../../lib/format';
import { SectionTitle } from '../../components/ui/SectionTitle';

import { Field } from '../../components/ui/Field';
import { PhoneField } from '../../components/ui/PhoneField';

function SummaryRow({ label, value }) { return <div className="flex justify-between gap-4 border-b border-line pb-3 text-sm"><span className="text-muted">{label}</span><span className="text-right font-medium">{value}</span></div>; }

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Hair', value: 'Hair' },
  { name: 'Nails', value: 'Nails' },
  { name: 'Makeup', value: 'Makeup' },
  { name: 'Skincare', value: 'Skincare' },
];

function StepSummary({ title, value, children }) {
  return (
    <div className="flex gap-4">
      <div className="w-28 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage">{title}</p>
        <p className="text-sm text-muted mt-0.5">{value}</p>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function Book() {
  const data = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);

  const serviceId = searchParams.get('service');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedService = serviceId
    ? data.services?.find((s) => s.id === serviceId && s.active)
    : null;

  const setService = (service) => { setSearchParams({ service: service.id }, { replace: true }); setDate(''); setTime(''); };

  const setStep = useCallback((next) => {
    setActiveStep((prev) => Math.max(0, Math.min(prev + next, 5)));
  }, []);

  const availableDates = useMemo(() => {
    const dates = [];
    const services = category ? data.services?.filter((s) => s.category === category && s.active) : null;
    const selector = Array.isArray(services) ? services : null;
    for (let offset = 0; offset <= 41; offset += 1) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (dateHasAvailability(data, iso)) dates.push(iso);
    }
    return dates;
  }, [data, category]);

  const availableTimes = selectedService && date
    ? getAvailableSlots(data, date).map((slot) => slot.time)
    : [];

  const selected = availableDates.includes(date) ? date : '';

  const handleNext = () => {
    const messages = {
      0: selectedService
        ? null
        : 'Please choose a service.',
      1: !date
        ? 'Please pick a date with a free slot.'
        : null,
      2: !time
        ? 'Please choose a time.'
        : null,
      3: !name
        ? 'Please enter your full name.'
        : name.trim().length < 2
          ? 'That name is too short.'
          : !isValidUgandanPhone(phone)
        ? 'Please use 07XXXXXXXX or +256XXXXXXXXX.'
        : null,
    };
    setError(messages[activeStep] || '');
    if (messages[activeStep]) return;
    setStep(1);
  };

  const handleBack = () => setStep(-1);

  const handleSubmit = async () => {
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          date,
          time,
          name,
          phone,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error || 'That booking could not be saved.');
        setSubmitting(false);
        return;
      }
      window.location.href = `/booking-confirmation?ref=${body.booking.reference}`;
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const isValidPhone = (value) => {
    const cleaned = String(value || '').replace(/[\s()-]/g, '');
    return /^(?:\+2567\d{8}|07\d{8})$/.test(cleaned);
  };

  return (
    <div>
      <SectionTitle
        eyebrow="Book online"
        title="Book your appointment"
        description="One service, two minutes — no account needed. Everything you need is here."
        align="left"
      />

      {error && <p role="alert" className="max-w-4xl mx-auto mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Progress */}
        <nav aria-label="Booking progress" className="flex items-center gap-2.5 sm:gap-3.5">
          <StepIndicator current={activeStep} setStep={setStep} />
        </nav>

        <div className="mt-8 sm:mt-10">
          {activeStep === 0 && (
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted">Choose a service</p>
                <p className="text-sm text-muted">One service only</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {(data.services || [])
                  .filter((service) => service.active && (!category || service.category === category))
                  .map((service) => (
                    <button
                      key={service.id}
                      onClick={() => {
                        setCategory('');
                        setService(service);
                      }}
                      className={`text-left p-4 rounded-2xl border transition ${
                        selectedService?.id === service.id
                          ? 'border-sage bg-sage/5 shadow-soft'
                          : 'border-transparent hover:border-line hover:bg-white'
                      }`}
                    >
                      <img
                        src={service.image?.startsWith('/') ? service.image : `/images/${service.image}.jpg`}
                        alt={service.name}
                        className="w-full h-32 object-cover rounded-xl mb-3"
                        loading="lazy"
                      />
                      <h3 className="font-semibold text-base">{service.name}</h3>
                      <p className="text-sm text-muted mt-1">{service.category}</p>
                      <p className="text-lg font-semibold mt-2">{formatUGX(service.price)}</p>
                    </button>
                  ))}
              </div>
              <p className="text-xs text-muted">
                The studio offers one service at a time. Choose carefully — if you’d like to book
                another, this session will end.
              </p>

              {!selectedService ? (
                <p className="text-sm text-amber-700">Please choose a service to continue.</p>
              ) : (
                <p className="text-sm text-muted">
                  {selectedService.name} — {formatUGX(selectedService.price)} ·{' '}
                  {selectedService.duration} minutes
                </p>
              )}

              <div className="flex gap-3">
                <NavLink to="/services" className="text-sm font-medium text-sage hover:text-sagedeep">
                  Back to services
                </NavLink>
                <Button variant="primary" onClick={handleNext} disabled={!selectedService}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted">Choose a date</p>
                <p className="text-sm text-muted">Available dates only</p>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium">
                {dateGridHeader().map((d) => (
                  <div key={d.iso} className="text-muted/60">
                    {d.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5 mt-2">
                {dateGrid().map((day) => {
                  const open = dateHasAvailability(data, day.iso);
                  const booked = isSlotBooked(data, day.iso, time) && day.iso === date;
                  return (
                    <button
                      key={day.iso}
                      disabled={!open}
                      onClick={() => { setDate(day.iso); setTime(''); }}
                      className={`relative aspect-[1/1.2] rounded-xl text-xs sm:text-sm p-1.5 transition ${
                        selected === day.iso && !day.isPast
                          ? 'bg-sage text-white'
                          : open
                            ? 'bg-ivory border border-line hover:bg-white text-charcoal'
                            : 'bg-ivory/40 text-muted/40 cursor-not-allowed'
                      }`}
                    >
                      {day.label}
                      {open ? (
                        <span
                          className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                            selected === day.iso ? 'bg-white' : 'bg-charcoal'
                          }`}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {!date ? (
                <p className="text-sm text-muted">Pick a date that has an open slot.</p>
              ) : (
                <p className="text-sm text-muted">
                  {formatDateLong(date)}{time ? ` · ${formatTime(time)}` : ''}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(-1)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={!date || !dateHasAvailability(data, date)}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted">Choose a time</p>
                <p className="text-sm text-muted">Available slots only</p>
              </div>

              {!selectedService ? (
                <p className="text-sm text-muted">Choose a service first.</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-charcoal">
                    {date} at {time ? formatTime(time) : 'Choose a time below'}
                  </p>
                  <p className="text-sm text-muted">{formatUGX(selectedService.price)} · {selectedService.duration} minutes</p>
                </>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableTimes.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-xl border p-4 text-left transition ${
                      time === slot
                        ? 'border-sage bg-sage/6 border-2'
                        : 'border-line hover:border-charcoal/30 hover:bg-white'
                    }`}
                  >
                    <p className={`text-sm font-semibold ${time === slot ? 'text-charcoal' : 'text-muted'}`}>
                      {formatTime(slot)}
                    </p>
                    <p className="text-xs text-muted mt-0.5">Available</p>
                  </button>
                ))}
              </div>

              {availableTimes.length === 0 ? (
                <p className="text-sm text-muted">No free slots on this date. Please choose another day.</p>
              ) : null}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(-1)}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext} disabled={!time}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted">Your details</p>
                <p className="text-sm text-muted">Your contact details</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Field label="Full name" htmlFor="booking-name">
                  <input
                    id="booking-name"
                    autoComplete="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amara Osei"
                    className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm transition ${error ? 'border-amber-500' : 'border-line'}`}
                  />
                </Field>
                <PhoneField
                  value={phone}
                  onChange={setPhone}
                  error={undefined}
                  placeholder="+256 700 000 000"
                />
              </div>

              <div className="p-4 rounded-2xl bg-ivory/60 border border-line">
                <p className="text-xs font-semibold uppercase tracking-wide text-sage">Remember</p>
                <p className="text-sm text-muted mt-1">
                  Check your name and phone number before continuing to review your appointment.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <p className="text-sm text-muted">Review your booking</p>
                <p className="text-sm text-muted">Please check everything</p>
              </div>

              <div className="space-y-4">
                <SummaryRow label="Service" value={selectedService.name} />
                <SummaryRow label="Price" value={formatUGX(selectedService.price)} />
                <SummaryRow label="Duration" value={`${selectedService.duration} minutes`} />
                <SummaryRow label="Date" value={date ? formatDateLong(date) : '—'} />
                <SummaryRow label="Time" value={time ? formatTime(time) : '—'} />
                <SummaryRow label="Name" value={name || '—'} />
                <SummaryRow label="Phone" value={phone ? formatPhone(phone) : '—'} />
              </div>

              <p className="text-xs text-muted">
                All fields marked with <span className="font-medium text-amber-700">*</span> are required.
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Confirm booking'}
                </Button>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current, setStep }) {
  const steps = ['Service', 'Date', 'Time', 'Details', 'Review'];
  return (
    <ol className="flex items-center gap-2.5 sm:gap-3.5">
      {steps.map((label, index) => {
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                active
                  ? 'bg-charcoal text-white'
                  : 'bg-ivory text-muted border border-line'
              }`}
            >
              {active ? (
                <CircleCheck className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span className={`text-xs font-medium hidden sm:block ${active ? 'text-charcoal' : 'text-muted'}`}>
              {label}
            </span>
            {index < steps.length - 1 ? (
              <div className={`w-5 h-px hidden sm:block ${active ? 'bg-charcoal' : 'bg-line/60'}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function dateGrid() {
  const first = new Date();
  first.setDate(1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.getDate(),
      past: isPastDate(d),
    });
  }
  return cells;
}

function isPastDate(d) {
  const today = new Date();
  return d.getFullYear() < today.getFullYear() || (d.getFullYear() === today.getFullYear() && d.getMonth() < today.getMonth()) || (d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() < today.getDate());
}

function dateGridHeader() {
  const first = new Date();
  first.setDate(1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    });
  }
  return cells;
}

function formatDateLong(iso) {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { weekday: 'long' })}, ${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'long' })} ${d.getFullYear()}`;
}
