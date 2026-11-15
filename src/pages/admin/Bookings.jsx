import { CircleCheck, Search, X } from 'lucide-react';
import { useState } from 'react';
import { formatDateLong, formatUGX, formatDuration } from '../../lib/format';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';

const STATUS_ORDER = ['confirmed', 'completed', 'cancelled'];

export function Bookings({ data }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);

  const bookings = data.bookings || [];
  const q = query.trim().toLowerCase();
  const filtered = bookings.filter((booking) => {
    if (statusFilter && booking.status !== statusFilter) return false;
    if (dateFilter && booking.date !== dateFilter) return false;
    if (q) {
      const matchesName = booking.customerName?.toLowerCase().includes(q);
      const matchesPhone = booking.customerPhone?.includes(q);
      const matchesRef = booking.reference?.toLowerCase().includes(q);
      if (!matchesName && !matchesPhone && !matchesRef) return false;
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const dateOptions = [...new Set(bookings.map((booking) => booking.date))].sort();
  const handleCancel = () => {
    if (confirmCancel) data.cancelBooking(confirmCancel.id);
    setConfirmCancel(null);
  };
  const handleComplete = () => {
    if (confirmComplete) data.completeBooking(confirmComplete.id);
    setConfirmComplete(null);
  };

  return (
    <div className="min-w-0">
      <div className="mb-6 space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, phone or reference"
            className="w-full min-w-0 rounded-2xl border border-line bg-white py-3 pl-9 pr-4 text-sm focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-2.5">
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full min-w-0 rounded-2xl border border-line bg-white py-3 px-3 text-sm focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20">
            <option value="">All statuses</option>
            {STATUS_ORDER.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
          </select>
          <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}
            className="w-full min-w-0 rounded-2xl border border-line bg-white py-3 px-3 text-sm focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20">
            <option value="">All dates</option>
            {dateOptions.map((date) => <option key={date} value={date}>{formatDateLong(date)}</option>)}
          </select>
          <button type="button" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-full lg:w-auto rounded-2xl border border-line bg-white py-3 px-4 text-sm font-semibold text-muted hover:bg-ivory transition">
            {sortOrder === 'asc' ? 'Earliest first' : 'Latest first'}
          </button>
        </div>
        <p className="text-xs text-muted">{filtered.length} of {bookings.length} bookings</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<CircleCheck className="w-5 h-5 shrink-0" aria-hidden="true" />}
            title="No bookings match" description="Try a different name, phone, status or date." />
        ) : (
          <div className="divide-y divide-line/60">
            {filtered.map((booking) => (
              <article key={booking.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-ivory/40 transition">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-sage/10 text-sage flex items-center justify-center text-sm font-semibold">
                    {booking.customerName?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted">{booking.customerPhone}</p>
                    <p className="sm:hidden text-xs text-muted mt-1">{booking.serviceName} · {booking.date} · {booking.time}</p>
                  </div>
                </div>
                <div className="hidden sm:block flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal">{booking.serviceName}</p>
                  <p className="text-xs text-muted">{booking.date} · {booking.time} · {formatDuration(booking.duration)}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">{formatUGX(booking.price)}</span>
                    <Badge variant={booking.status === 'confirmed' ? 'white' : booking.status === 'completed' ? 'sage' : 'amber'}>{booking.status}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:ml-2">
                    {booking.status === 'confirmed' ? (
                      <>
                        <button type="button" onClick={() => setConfirmComplete(booking)}
                          className="min-w-10 min-h-10 p-2 rounded-xl text-muted hover:text-white hover:bg-sage transition"
                          aria-label={`Mark ${booking.customerName}'s booking completed`} title="Mark completed">
                          <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setConfirmCancel(booking)}
                          className="min-w-10 min-h-10 p-2 rounded-xl text-muted hover:text-amber-800 hover:bg-amber-100 transition"
                          aria-label={`Cancel ${booking.customerName}'s booking`} title="Cancel booking">
                          <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </button>
                      </>
                    ) : <span className="p-2 rounded-xl bg-ivory text-muted" aria-label={booking.status}><CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" /></span>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <Modal open={!!confirmCancel} onClose={() => setConfirmCancel(null)} title="Cancel this booking?"
        description="The customer will be able to see the slot released and can book elsewhere." size="sm"
        actions={<>
          <button type="button" onClick={() => setConfirmCancel(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Keep booking</button>
          <button type="button" onClick={handleCancel} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500 transition">Confirm cancel</button>
        </>}>
        <p className="text-sm text-muted">Cancel booking <span className="font-mono">{confirmCancel?.reference}</span> for {confirmCancel?.customerName}?</p>
      </Modal>

      <Modal open={!!confirmComplete} onClose={() => setConfirmComplete(null)} title="Mark as completed?"
        description="This booking will move to history and be retained with its original details." size="sm"
        actions={<>
          <button type="button" onClick={() => setConfirmComplete(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Not yet</button>
          <button type="button" onClick={handleComplete} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-sage text-white hover:bg-sagedeep transition">Mark completed</button>
        </>}>
        <p className="text-sm text-muted">Mark booking <span className="font-mono">{confirmComplete?.reference}</span> for {confirmComplete?.customerName} as completed?</p>
      </Modal>
    </div>
  );
}
