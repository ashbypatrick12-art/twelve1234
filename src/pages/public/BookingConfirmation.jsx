import { ArrowLeft, CircleAlert, CircleCheck, MessageCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { formatUGX, formatPhone, waLink } from '../../lib/format';
import { Button } from '../../components/ui/Button';

export function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const data = useStore();
  const ref = searchParams.get('ref') || '';
  const booking = data.bookings?.find((b) => b.reference === ref) || null;

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-5">
          <CircleAlert className="w-6 h-6 shrink-0" aria-hidden="true" />
        </div>
        <h2 className="font-display text-2xl font-semibold">We couldn’t find that booking.</h2>
        <p className="mt-2 text-muted max-w-sm">
          Check the reference and try again, or book a new appointment below.
        </p>
        <div className="mt-8">
          <NavLink to="/">
            <Button variant="secondary">Back home</Button>
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-charcoal text-white flex items-center justify-center mx-auto mb-6 shadow-soft">
        <CircleCheck className="w-7 h-7 shrink-0" aria-hidden="true" />
      </div>

      <p className="section-title__eyebrow mb-2">Confirmed</p>
      <h2 className="font-display text-3xl font-semibold">Your appointment is ready.</h2>
      <p className="mt-3 text-muted">
        You’re all set, {booking.customerName}. Here’s everything we need for your visit.
      </p>

      <div className="mt-8 p-5 sm:p-6 rounded-3xl bg-white border border-line/70 shadow-soft text-left">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-sage">Booking reference</span>
          <span className="text-sm font-mono font-semibold text-charcoal bg-ivory px-3 py-1.5 rounded-full">
            {booking.reference}
          </span>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Service</span>
            <span className="font-medium text-charcoal">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Price</span>
            <span className="font-medium text-charcoal">{formatUGX(booking.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Duration</span>
            <span className="font-medium text-charcoal">{booking.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Date</span>
            <span className="font-medium text-charcoal">{new Date(booking.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Time</span>
            <span className="font-medium text-charcoal">{booking.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Joined by</span>
            <span className="font-medium text-charcoal">{booking.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Phone</span>
            <span className="font-medium text-charcoal">{formatPhone(booking.customerPhone)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <NavLink to="/">
          <Button variant="primary">
            Back home
            <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          </Button>
        </NavLink>
        <a
          href={waLink('256700000000', `Hi Serene Beauty, I have a booking reference ${booking.reference}. Could you confirm my appointment?` )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ivory text-charcoal border border-charcoal/10 px-6 py-3 text-sm font-semibold hover:bg-white hover:shadow-soft transition"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          WhatsApp us
        </a>
      </div>

      <p className="text-xs text-muted mt-6">
        Mobile and WhatsApp messages go to the studio number.
      </p>
    </div>
  );
}
