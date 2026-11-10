import { ArrowRight, CalendarDays, Clock3, Sparkles, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { formatDateLong, formatTime, formatUGX } from '../../lib/format';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

export function Overview({ data }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayBookings = data.bookings?.filter(
    (b) => b.status !== 'cancelled' && b.date === today,
  ) || [];
  const upcoming = data.bookings?.filter((b) => b.status !== 'cancelled' && b.date > today).sort((a, b) => a.date.localeCompare(b.date)) || [];
  const recent = [...data.bookings || []]
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const customers = data.customers || [];
  const totalBookings = data.bookings?.filter((b) => b.status !== 'cancelled').length || 0;
  const cancelled = data.bookings?.filter((b) => b.status === 'cancelled').length || 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        <StatCard label="Today’s appointments" value={todayBookings.length} icon={<CalendarDays className="w-5 h-5 shrink-0" aria-hidden="true" />} />
        <StatCard label="Upcoming" value={upcoming.length} icon={<Clock3 className="w-5 h-5 shrink-0" aria-hidden="true" />} />
        <StatCard label="Total bookings" value={totalBookings} icon={<ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />} />
        <StatCard label="Cancelled" value={cancelled} icon={<X className="w-5 h-5 shrink-0" aria-hidden="true" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Today’s appointments</h3>
            <NavLink to="/admin/bookings" className="text-sm font-medium text-sage hover:text-sagedeep transition">
              Full list
              <ArrowRight className="w-4 h-4 ml-1 shrink-0" aria-hidden="true" />
            </NavLink>
          </div>
          {todayBookings.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="w-5 h-5 shrink-0" aria-hidden="true" />}
              title="No appointments today"
              description="The studio is quiet for now. New bookings will appear here the moment they’re made."
            />
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-xl bg-ivory/60 border border-line/60">
                  <div className="w-10 h-10 rounded-full bg-sage/15 flex items-center justify-center text-sage font-semibold text-sm">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-charcoal truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted">{booking.serviceName} · {booking.date} {booking.time}</p>
                  </div>
                  <Badge variant="white">{booking.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg mb-4">Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted">Nothing scheduled yet.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-sage" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted">{booking.date} · {booking.time}</p>
                  </div>
                  <span className="text-xs font-semibold text-sage">{booking.serviceName}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg mb-4">Useful shortcuts</h3>
          <div className="space-y-2 text-sm">
            <Shortcut to="/admin/bookings" icon={<CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />} label="Bookings" description="View all appointments" />
            <Shortcut to="/admin/calendar" icon={<CalendarDays className="w-4 h-4 shrink-0" aria-hidden="true" />} label="Calendar" description="Day, week, month views" />
            <Shortcut to="/admin/services" icon={<Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />} label="Services" description="Add and edit the menu" />
            <Shortcut to="/admin/customers" icon={<Users className="w-4 h-4 shrink-0" aria-hidden="true" />} label="Customers" description="Record and search" />
            <Shortcut to="/admin/availability" icon={<Clock3 className="w-4 h-4 shrink-0" aria-hidden="true" />} label="Availability" description="Open days and slots" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg mb-4">Recent bookings</h3>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ivory border border-line flex items-center justify-center text-xs font-semibold text-sage">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{booking.customerName}</p>
                    <p className="text-xs text-muted">{booking.serviceName} · {booking.status}</p>
                  </div>
                  <span className="text-xs font-mono text-sage">{booking.reference}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-semibold text-lg mb-4">Customers</h3>
          {customers.length === 0 ? (
            <p className="text-sm text-muted">No customers yet. Names and phones from bookings will appear here.</p>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 6).map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage/15 text-sage flex items-center justify-center text-sm font-semibold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-charcoal">{customer.name}</p>
                      <p className="text-xs text-muted">{customer.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">{data.bookings?.filter((b) => b.customerId === customer.id).length} booking{data.bookings?.filter((b) => b.customerId === customer.id).length !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sage/10 text-sage flex items-center justify-center">
          {icon}
        </div>
        <p className="text-2xl font-semibold text-charcoal">{value}</p>
      </div>
      <p className="text-sm text-muted mt-2">{label}</p>
    </Card>
  );
}

function Shortcut({ to, icon, label, description }) {
  return (
    <NavLink to={to} className="flex items-start gap-3 p-3 rounded-xl hover:bg-ivory/60 transition group">
      <span className="w-8 h-8 rounded-lg bg-ivory text-sage flex items-center justify-center group-hover:bg-charcoal/5 group-hover:text-sage transition">
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-charcoal">{label}</p>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>
    </NavLink>
  );
}
