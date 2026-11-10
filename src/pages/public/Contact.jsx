import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { formatUGX } from '../../lib/format';
import { Footer } from '../../components/public/Footer';

const HOURS = [
  { day: 'Monday', hours: '09:00 – 19:00' },
  { day: 'Tuesday', hours: '09:00 – 19:00' },
  { day: 'Wednesday', hours: '09:00 – 19:00' },
  { day: 'Thursday', hours: '09:00 – 19:00' },
  { day: 'Friday', hours: '09:00 – 19:00' },
  { day: 'Saturday', hours: '09:00 – 20:00' },
  { day: 'Sunday', hours: '10:30 – 16:00' },
];

export function Contact() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <p className="section-title__eyebrow mb-3">Get in touch</p>
            <h2 className="font-display text-3xl sm:text-4xl leading-tight">
              Let’s talk about what you <span className="italic">need.</span>
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              The studio is on the third floor of Acacia House, a five-minute walk from Kololo
              roundabout. You’ll find a lift and a small car park up front.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-ivory/70 text-sage flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-sm">Studio address</p>
                  <p className="text-sm text-muted">Plot 12, Acacia Avenue, Kololo, Kampala</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-ivory/70 text-sage flex items-center justify-center flex-shrink-0">
                  <Phone className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-sm">Phone &amp; WhatsApp</p>
                  <p className="text-sm text-muted">+256 700 000 000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-ivory/70 text-sage flex items-center justify-center flex-shrink-0">
                  <Mail className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <p className="text-sm text-muted">hello@serenebeauty.example</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-full bg-ivory/70 text-sage flex items-center justify-center flex-shrink-0">
                  <Clock3 className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-sm">Opening hours</p>
                  <p className="text-sm text-muted">
                    Mon – Fri: 09:00 – 19:00
                    <br />
                    Saturday: 09:00 – 20:00
                    <br />
                    Sunday: 10:30 – 16:00
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-2xl bg-white border border-line/70 shadow-soft">
              <p className="text-sm font-semibold text-charcoal mb-3">Ask about a group booking</p>
              <p className="text-sm text-muted leading-relaxed">
                Brides, groups and company visits get priority scheduling. Tell us roughly how
                many, and what you’d like, and we’ll confirm a room and a stylist within a day.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-charcoal text-white px-5 py-2.5 text-sm font-semibold hover:bg-charcoal/90 transition">
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                Send us a note
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {HOURS.map((item) => (
              <div key={item.day} className="rounded-2xl bg-white border border-line/70 p-4 shadow-soft">
                <p className="text-xs font-medium text-sage uppercase tracking-wide">{item.day}</p>
                <p className="text-sm font-semibold text-charcoal mt-0.5">{item.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-line/70 shadow-soft p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="section-title__eyebrow mb-3">Location</p>
            <h2 className="font-display text-3xl sm:text-4xl leading-tight">
              Right beside the road, <span className="italic">easy to find.</span>
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Kololo is one of Kampala’s most walkable neighbourhoods. The studio is behind a
              paved laneway marked “Acacia House” — a clear blue sign at the junction.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent('Plot 12, Acacia Avenue, Kololo, Kampala')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-charcoal text-white px-5 py-2.5 text-sm font-semibold hover:bg-charcoal/90 transition"
              >
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                Open in Google Maps
              </a>
            </div>
          </div>
          <div>
            <img
              src="/images/about.jpg"
              alt="Studio interior"
              className="rounded-3xl object-cover shadow-soft w-full h-[320px] sm:h-[420px]"
              loading="lazy"
            />
            <div className="mt-4 flex items-center gap-3 text-sm text-ivory/70">
              <span className="w-2.5 h-2.5 rounded-full bg-charcoal" />
              <span>Accessible entrance · lift service</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
