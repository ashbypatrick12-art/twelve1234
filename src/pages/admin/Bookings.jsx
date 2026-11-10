import { CircleCheck, Search, X } from 'lucide-react';
import { useState } from 'react';
import { cancelBooking, completeBooking } from '../../lib/store';
import { formatDateLong, formatTime, formatUGX, formatPhone, formatDuration } from '../../lib/format';
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
  const [selected, setSelected] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);

  const bookings = data.bookings || [];
  const q = query.trim().toLowerCase();

  const filtered = bookings
    .filter((booking) => {
      if (statusFilter && booking.status !== statusFilter) return false;
      if (dateFilter && booking.date !== dateFilter) return false;
      if (q) {
        const matchesName = booking.customerName?.toLowerCase().includes(q);
        const matchesPhone = booking.customerPhone?.includes(q);
        const matchesRef = booking.reference?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesRef) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const statuses = ['all', ...STATUS_ORDER];
  const dateOptions = [...new Set(bookings.map((b) => b.date))].sort();

  const handleCancel = () => {
    if (confirmCancel?.id) cancelBooking(data, confirmCancel.id);
    setConfirmCancel(null);
  };

  const handleComplete = () => {
    if (confirmComplete?.id) completeBooking(data, confirmComplete.id);
    setConfirmComplete(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone"
              className="w-full rounded-2xl border border-line bg-white py-2.5 pl-9 pr-4 text-sm transition focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-line bg-white py-2.5 pl-3 pr-8 text-sm transition focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20"
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl border border-line bg-white py-2.5 pl-3 pr-8 text-sm transition focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20"
          >
            <option value="">All dates</option>
            {dateOptions.map((date) => (
              <option key={date} value={date}>{formatDateLong(date)}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-2xl border border-line bg-white py-2.5 px-4 text-sm font-semibold text-muted hover:bg-white transition"
          >
            {sortOrder === 'asc' ? 'Earliest first' : 'Latest first'}
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CircleCheck className="w-5 h-5 shrink-0" aria-hidden="true" />}
            title="No bookings match"
            description="Try a different name, phone, status or date."
          />
        ) : (
          <div className="divide-y divide-line/60">
            {filtered.map((booking) => (
              <div key={booking.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-ivory/40 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-sage/10 text-sage flex items-center justify-center text-sm font-semibold">
                    {booking.customerName?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted">{booking.customerPhone}</p>
                  </div>
                </div>
                <div className="flex-1 min-w-0 hidden sm:block">
                  <p className="text-sm font-medium text-charcoal">{booking.serviceName}</p>
                  <p className="text-xs text-muted">
                    {booking.date} · {booking.time} · {formatDuration(booking.duration)}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-muted">{formatUGX(booking.price)}</span>
                  <Badge variant={booking.status === 'confirmed' ? 'white' : booking.status === 'completed' ? 'sage' : 'amber'}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs font-mono text-sage hidden sm:inline">{booking.reference}</span>
                  <div className="flex gap-1.5">
                    {booking.status === 'confirmed' ? (
                      <>
                        <button
                          onClick={() => setConfirmComplete(booking)}
                          className="p-2 rounded-xl text-muted hover:text-white hover:bg-sage transition"
                          aria-label="Mark completed"
                        >
                          <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => setConfirmCancel(booking)}
                          className="p-2 rounded-xl text-muted hover:text-white hover:bg-amber-600/20 transition"
                          aria-label="Cancel booking"
                        >
                          <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <span className="p-2 rounded-xl bg-ivory text-muted">
                        <CircleCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        title="Cancel this booking?"
        description="The customer will be able to see the slot released and can book elsewhere."
        size="sm"
        actions={
          <>
            <button onClick={() => setConfirmCancel(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Cancel</button>
            <button onClick={handleCancel} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-500 transition">Confirm cancel</button>
          </>
        }
      >
        <p className="text-sm text-muted">Cancel booking <span className="font-mono">{confirmCancel?.reference}</span> for {confirmCancel?.customerName}?</p>
      </Modal>

      <Modal
        open={!!confirmComplete}
        onClose={() => setConfirmComplete(null)}
        title="Mark as completed?"
        description="This booking will move to history and be retained with its original details."
        size="sm"
        actions={
          <>
            <button onClick={() => setConfirmComplete(null)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-ivory transition">Cancel</button>
            <button onClick={handleComplete} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-sage text-white hover:bg-sagedeep transition">Mark completed</button>
          </>
        }
      >
        <p className="text-sm text-muted">Mark booking <span className="font-mono">{confirmComplete?.reference}</span> for {confirmComplete?.customerName} as completed?</p>
      </Modal>
    </div>
  );
}
