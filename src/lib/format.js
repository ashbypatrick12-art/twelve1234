import { MONTH_NAMES, formatDateLong, formatDuration, formatTime } from './dates';

export { formatDateLong, formatDuration, formatTime };

export function formatDateShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

/** Ugandan shillings, without a trailing 's' or decimal places. */
export function formatUGX(amount) {
  const n = Number(amount) || 0;
  return `UGX ${n.toLocaleString('en-US')}`;
}

/** Ugandan mobile numbers render as compact groups. */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  const local = digits.startsWith('256') ? `0${digits.slice(3)}` : digits;
  if (local.length === 10) return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  return phone;
}

/** Accepts 07XXXXXXXX or +256XXXXXXXXX (country code plus 9 digits). */
export function isValidUgandanPhone(input) {
  const cleaned = String(input || '').replace(/[\s()-]/g, '');
  return /^(?:\+2567\d{8}|07\d{8})$/.test(cleaned);
}

/** Normalises a valid Ugandan number to local 07XXXXXXXX form. */
export function normalizePhone(input) {
  const cleaned = String(input || '').replace(/[\s()-]/g, '');
  if (cleaned.startsWith('+256')) return `0${cleaned.slice(4)}`;
  if (cleaned.startsWith('256')) return `0${cleaned.slice(3)}`;
  return cleaned;
}

/** Builds a click-to-chat link with an optional prefilled message. */
export function waLink(number, message) {
  const digits = String(number || '').replace(/\D/g, '');
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
