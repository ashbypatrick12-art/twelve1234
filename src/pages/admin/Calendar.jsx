import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatUGX, formatDuration } from '../../lib/format';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore, isSlotBooked, getAvailableSlots, getDayHours, dateHasAvailability, isDateOpen } from '../../lib/store';
import { formatDateLong, formatDateMedium, formatTime, addDaysISO, startOfWeek, toISODate } from '../../lib/dates';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ data }) {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState('month');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const date = current;
  const year = date.getFullYear();
  const month = date.getMonth();

  const grid = dateGrid(year, month);

  const today = toISODate(new Date());
  const currentISO = toISODate(current);

  const handleDayClick = (iso) => {
    setSelected(iso);
    setDetailOpen(true);
  };

  const monthLabel = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const weeks = view === 'month' ? grid.flat() : (view === 'week' ? Array.from({ length: 7 }, (_, index) => { const iso = addDaysISO(startOfWeek(currentISO), index); return { iso, label: formatDateMedium(iso) }; }) : [{ iso: currentISO, label: formatDateMedium(currentISO) }]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-2xl">{monthLabel}</h3>
          <p className="text-sm text-muted">{view === 'month' ? 'Month view' : view === 'week' ? 'Week view' : 'Day view'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${view === 'month' ? 'bg-charcoal text-white' : 'bg-ivory text-muted hover:bg-white'}`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${view === 'week' ? 'bg-charcoal text-white' : 'bg-ivory text-muted hover:bg-white'}`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${view === 'day' ? 'bg-charcoal text-white' : 'bg-ivory text-muted hover:bg-white'}`}
          >
            Day
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="rounded-xl bg-white border border-line px-3.5 py-2 text-sm font-semibold text-muted hover:bg-ivory transition"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent(view === 'month' ? new Date(current.getFullYear(), current.getMonth() - 1, 1) : new Date(`${addDaysISO(currentISO, view === 'week' ? -7 : -1)}T12:00:00`))}
            className="p-2 rounded-xl text-muted hover:bg-ivory transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
          <button
            onClick={() => setCurrent(view === 'month' ? new Date(current.getFullYear(), current.getMonth() + 1, 1) : new Date(`${addDaysISO(currentISO, view === 'week' ? 7 : 1)}T12:00:00`))}
            className="p-2 rounded-xl text-muted hover:bg-ivory transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>
      </div>

      {view === 'month' ? (
        <Card className="p-4 sm:p-6 overflow-hidden">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
            {DAY_LABELS.map((label) => (
              <div key={label} className="text-center text-xs font-semibold text-sage/80 py-2">{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weeks.map((day, index) => {
              const iso = day.iso;
              const open = dateHasAvailability(data, iso);
              const bookedCount = data.bookings?.filter((b) => b.date === iso && b.status !== 'cancelled').length || 0;
              return (
                <button
                  key={iso}
                  onClick={() => open ? handleDayClick(iso) : undefined}
                  className={`relative aspect-[1/1.2] rounded-xl p-1.5 text-left transition sm:pe-2 ${
                    iso === today ? 'bg-sage/20 text-sagedeep' :
                    open ? 'bg-ivory border border-line hover:bg-white' : 'bg-ivory/30 text-muted/30 cursor-not-allowed'
                  }`}
                >
                  <span className="block text-xs sm:text-sm leading-none">{day.label}</span>
                  {bookedCount > 0 ? (
                    <span className={`absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full sm:rounded-lg ${iso === today ? 'bg-white' : 'bg-charcoal'}`} />
                  ) : null}
                  {open ? <span className={`absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full sm:rounded-lg ${iso === today ? 'bg-white' : 'bg-charcoal'}`} /> : null}
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeks.map((day, index) => {
            const iso = day.iso;
            const open = dateHasAvailability(data, iso);
            const hours = getDayHours(data, iso);
            const booked = data.bookings?.filter((b) => b.date === iso && b.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time)) || [];
            return (
              <div
                key={iso}
                className={`relative rounded-2xl border p-3 ${iso === today ? 'border-sage bg-sage/5' : open ? 'border-line bg-ivory hover:bg-white' : 'border-line bg-ivory/20 opacity-60'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">{day.label}</span>
                  <span className="text-xs text-muted">{hours?.open ? formatTime(hours.start) : 'Closed'}</span>
                </div>
                {booked.length === 0 ? (
                  <p className="text-xs text-muted">No appointments</p>
                ) : (
                  <div className="space-y-1.5">
                    {booked.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => { setSelected(booking.date); setDetailOpen(true); }}
                        className="w-full text-left rounded-xl px-2.5 py-1.5 bg-sage/10 hover:bg-sage/20 transition text-left"
                      >
                        <span className="block text-xs font-semibold text-charcoal leading-tight truncate">{booking.customerName}</span>
                        <span className="text-xs text-muted">{booking.time}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!open ? (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted/50">Closed today</span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selected ? (view === 'month' ? formatDateMedium(selected) : formatDateLong(selected)) : 'Appointment'}
        description={selected ? `${selected} · ${getDayHours(data, selected)?.open ? formatTime(getDayHours(data, selected).start) : 'Closed'}` : ''}
        actions={
          <button onClick={() => setDetailOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Close</button>
        }
      >
        {selected ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(data.bookings || []).filter((booking) => booking.date === (typeof selected === 'string' ? selected : selected.date) && booking.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time)).map((booking) => (
                <div key={booking.id} className="p-4 rounded-2xl bg-ivory/60 border border-line">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sage/15 text-sage flex items-center justify-center text-sm font-semibold">{booking.customerName.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{booking.customerName}</p>
                        <p className="text-xs text-muted">{booking.customerPhone} · {booking.serviceName}</p>
                      </div>
                    </div>
                    <Badge variant="white">{booking.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted">Time</span><p className="font-medium text-charcoal">{booking.time}</p></div>
                    <div><span className="text-muted">Price</span><p className="font-medium text-charcoal">{formatUGX(booking.price)}</p></div>
                    <div><span className="text-muted">Duration</span><p className="font-medium text-charcoal">{formatDuration(booking.duration)}</p></div>
                    <div><span className="text-muted">Reference</span><p className="font-mono text-xs text-sage">{booking.reference}</p></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <NavLink to="/admin/bookings" className="flex-1 text-center px-3 py-1.5 rounded-xl text-sm font-semibold bg-charcoal text-white hover:bg-charcoal/90 transition">View bookings</NavLink>
                    <a href={`https://wa.me/${String(booking.customerPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello, I’m following up about your appointment ${booking.reference}.`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-ivory border border-charcoal/10 text-charcoal hover:bg-white transition">Message on WhatsApp</a>
                  </div>
                </div>
              ))}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function dateGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const weeks = [];
  for (let i = 0; i < 6; i += 1) {
    const week = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + d + i * 7);
      week.push({ iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`, label: date.getDate() });
    }
    weeks.push(week);
  }
  return weeks;
}
