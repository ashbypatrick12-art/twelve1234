import { Clock3, Plus } from 'lucide-react';
import { useState } from 'react';
import { useStore, isDateOpen, getBookedTimes, getAvailableSlots, getSlotsForDate, getDayHours, isSlotBooked, dateHasAvailability, getOpenTimeRange, addSlot, removeSlot, addClosedDate, removeClosedDate, updateWeeklyDay, getOpenDays } from '../../lib/store';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDateLong, formatTime, formatTimeRange, addDaysISO, dayOfWeek, isPastDate, toISODate } from '../../lib/dates';
import { formatUGX } from '../../lib/format';

export function Availability({ data }) {
  const [date, setDate] = useState(toISODate(new Date()));
  const [slotTimes, setSlotTimes] = useState(['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00']);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [adding, setAdding] = useState(false);
  const [slotError, setSlotError] = useState('');

  const weekly = data.availability?.weekly || [];
  const closed = data.availability?.closedDates || [];
  const bookedSlots = (data.bookings || []).filter((b) => b.status !== 'cancelled').map((b) => `${b.date}-${b.time}`);

  const openDays = getOpenDays(data);
  const openToday = openDays.some((w) => w.day === dayOfWeek(toISODate(new Date())));
  const tomorrow = addDaysISO(toISODate(new Date()), 1);
  const hasTomorrow = isDateOpen(data, tomorrow);

  function openForDay(day) {
    return isDateOpen(data, day);
  }

  const view = data; // param name kept simple

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg">Opening days</h3>
          <p className="text-sm text-muted mt-1">Set which days the studio is open.</p>
          <div className="mt-4 space-y-2">
            {weekly.map((day) => {
              const hours = getDayHours(data, '');
              return (
                <div key={day.day} className="flex items-center gap-3 p-3 rounded-xl bg-ivory/50 border border-line">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${day.open ? 'bg-white text-charcoal border border-line' : 'bg-ivory/40 text-muted border border-line'}`}>{day.day}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{formatDayName(day.day)}</p>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="time"
                        value={day.start}
                        onChange={() => {}}
                        className="rounded-lg border border-line px-2 py-1 text-xs"
                        disabled={!day.open}
                      />
                      <input
                        type="time"
                        value={day.end}
                        onChange={() => {}}
                        className="rounded-lg border border-line px-2 py-1 text-xs"
                        disabled={!day.open}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-sage">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={() => {}}
                      className="rounded border-line text-sage focus:ring-sage"
                    />
                    {day.open ? 'Open' : 'Closed'}
                  </label>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg">Closed dates</h3>
          <p className="text-sm text-muted mt-1">Mark a date where the studio has no appointment for the whole day.</p>
          <div className="mt-4 space-y-2">
            {closed.map((d) => (
              <div key={d} className="flex items-center justify-between p-3 rounded-xl bg-ivory/50 border border-line">
                <div>
                  <p className="text-sm font-medium text-charcoal">{formatDateLong(d)}</p>
                </div>
                <button onClick={() => {}} className="text-xs font-semibold text-amber-700 hover:text-amber-800">Remove</button>
              </div>
            ))}
            {closed.length === 0 ? <p className="text-sm text-muted">No closed dates set.</p> : null}
          </div>
          <button onClick={() => {}} className="mt-3 text-sm font-semibold text-sage hover:text-sagedeep transition">
            Add a closed date
          </button>
        </Card>

        <Card className="p-5 sm:p-6 lg:col-span-3">
          <h3 className="font-semibold text-lg">Time slots</h3>
          <p className="text-sm text-muted mt-1">
            Manually created time slots for any open date. Each booking takes one slot, and the system never invents slots automatically.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={() => {}}
              className="rounded-xl bg-ivory border border-line px-3 py-2 text-sm font-semibold text-muted hover:bg-white transition"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              Add
            </button>
            <button
              onClick={() => {}}
              className="rounded-xl bg-ivory border border-line px-3 py-2 text-sm font-semibold text-muted hover:bg-white transition"
            >
              <Clock3 className="w-4 h-4 shrink-0" aria-hidden="true" />
              Fill week
            </button>
          </div>

          {!dateHasAvailability(data, date) ? <p className="text-sm text-muted mt-3">That date is closed or has no slots yet.</p> : null}

          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {getSlotsForDate(data, date).map((slot) => {
              const booked = isSlotBooked(data, date, slot.time);
              const available = getAvailableSlots(data, date).some((s) => s.time === slot.time);
              return (
                <div key={slot.id} className={`flex items-center justify-between p-3 rounded-xl border ${booked ? 'bg-amber-500/5 border-amber-400/20' : 'bg-white border-line'}`}>
                  <div>
                    <p className="text-sm font-medium text-charcoal">{formatTime(slot.time)}</p>
                    <p className="text-xs text-muted">{booked ? 'Booked' : available ? 'Available' : 'Locked'}</p>
                  </div>
                  <button
                    onClick={() => {}}
                    disabled={booked}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${booked ? 'bg-amber-600/20 text-amber-700 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-500'}`}
                  >
                    {booked ? 'Locked' : 'Remove'}
                  </button>
                </div>
              );
            })}
            {getSlotsForDate(data, date).length === 0 ? <p className="text-sm text-muted">No slots configured for this date.</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatDayName(day) {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[day] || 'Unknown';
}
