import { Users } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { NavLink } from 'react-router-dom';
import { formatDateLong, formatPhone } from '../../lib/format';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatUGX } from '../../lib/format';

export function Customers({ data }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const customers = data.customers || [];
  const q = query.trim().toLowerCase();

  const filtered = customers.filter((customer) => {
    const matchesName = customer.name?.toLowerCase().includes(q);
    const matchesPhone = formatPhone(customer.phone).toLowerCase().includes(q);
    if (!matchesName && !matchesPhone) return false;
    return true;
  });

  const handleSelect = (customer) => setSelected(customer);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted shrink-0" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone"
            className="w-full rounded-2xl border border-line bg-white py-2.5 pl-9 pr-4 text-sm transition focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="divide-y divide-line/60">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Users className="w-5 h-5 shrink-0" aria-hidden="true" />}
                title="No matching customer"
                description="Check the spelling of the name or phone number."
              />
            ) : (
              filtered.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-ivory/50 transition"
                >
                  <div className="w-11 h-11 rounded-full bg-sage/10 text-sage flex items-center justify-center text-sm font-semibold">{customer.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{customer.name}</p>
                    <p className="text-xs text-muted">{formatPhone(customer.phone)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-charcoal">{data.bookings?.filter((b) => b.customerId === customer.id).length} booking{data.bookings?.filter((b) => b.customerId === customer.id).length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-muted">{data.bookings?.filter((b) => b.customerId === customer.id && b.status === 'confirmed').length} confirmed</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-charcoal">{selected.name}</p>
                <p className="text-sm text-muted">{formatPhone(selected.phone)}</p>
              </div>
              <p className="text-xs text-muted">Created {formatDateLong(selected.createdAt)}</p>
              <div>
                <p className="text-sm font-semibold text-charcoal">Booking history</p>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {(data.bookings || [])
                    .filter((b) => b.customerId === selected.id)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-ivory/50 border border-line">
                        <div>
                          <p className="text-sm font-medium text-charcoal">{booking.serviceName}</p>
                          <p className="text-xs text-muted">{booking.date} · {booking.time}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={booking.status === 'confirmed' ? 'white' : booking.status === 'completed' ? 'sage' : 'amber'}>{booking.status}</Badge>
                          <p className="text-xs font-mono text-sage mt-1">{booking.reference}</p>
                        </div>
                      </div>
                    ))}
                  {data.bookings?.filter((b) => b.customerId === selected.id).length === 0 ? <p className="text-sm text-muted">No bookings yet.</p> : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-ivory border border-line flex items-center justify-center text-sage mb-4">
                <Users className="w-5 h-5 shrink-0" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg">Open a customer record</h3>
              <p className="text-sm text-muted">Customers appear automatically from bookings. Search to find them.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
