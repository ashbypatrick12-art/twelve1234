// Date helpers — all dates are handled as local 'YYYY-MM-DD' strings to
// avoid timezone drift between the browser calendar and stored records.

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n) => String(n).padStart(2, '0');

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(iso) {
  if (!iso) return new Date(NaN);
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDaysISO(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function dayOfWeek(iso) {
  return parseISODate(iso).getDay();
}

export function formatDateShort(iso) {
  const d = parseISODate(iso);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export function formatDateLong(iso) {
  const d = parseISODate(iso);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateMedium(iso) {
  const d = parseISODate(iso);
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

export function formatMonthYear(year, month) {
  return `${MONTH_NAMES[month]} ${year}`;
}

/** 6x7 grid of ISO dates covering the given month, starting on Sunday. */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = addDaysISO(toISODate(first), -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDaysISO(start, i));
}

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export function formatTimeRange(start, end) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatTimestamp(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${formatTime(
    `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  )}`;
}

export function relativeDayLabel(iso) {
  const today = todayISO();
  if (iso === today) return 'Today';
  if (iso === addDaysISO(today, 1)) return 'Tomorrow';
  if (iso === addDaysISO(today, -1)) return 'Yesterday';
  return formatDateMedium(iso);
}

export function isPastDate(iso) {
  return iso < todayISO();
}

export function isPastSlot(iso, time) {
  const today = todayISO();
  if (iso < today) return true;
  if (iso > today) return false;
  const now = new Date();
  return timeToMinutes(time) <= now.getHours() * 60 + now.getMinutes();
}

/** Sunday-first start of the week for a given ISO date. */
export function startOfWeek(iso) {
  return addDaysISO(iso, -dayOfWeek(iso));
}

export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr${h > 1 ? 's' : ''}`;
  return `${m} min`;
}
