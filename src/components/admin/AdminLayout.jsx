import { CalendarCheck, CalendarDays, Clock3, LayoutDashboard, Scissors, Sparkles, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/format';

const sections = [
  { name: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { name: 'bookings', icon: CalendarCheck, label: 'Bookings' },
  { name: 'calendar', icon: CalendarDays, label: 'Calendar' },
  { name: 'services', icon: Scissors, label: 'Services' },
  { name: 'availability', icon: Clock3, label: 'Availability' },
  { name: 'customers', icon: Users, label: 'Customers' },
];

export function AdminLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ivory font-sans text-charcoal">
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 shrink-0 border-r border-line bg-white">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-line/70">
          <span className="w-9 h-9 rounded-full bg-sage text-white flex items-center justify-center">
            <Sparkles className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Gency Bookings</p>
            <p className="text-xs text-muted">Serene Beauty Studio</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sections.map((section) => {
            const active = path.startsWith(`/admin/${section.name}`);
            return (
              <NavLink
                key={section.name}
                to={`/admin/${section.name}`}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition',
                  active
                    ? 'bg-charcoal/5 text-charcoal shadow-soft'
                    : 'text-muted hover:bg-ivory/60 hover:text-charcoal',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <section.icon size={18} className="shrink-0" aria-hidden="true" />
                {section.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5 px-3 py-4 border-t border-line/70">
          <div className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center text-sm font-bold">
            SB
          </div>
          <p className="text-sm font-medium truncate">Serene Beauty Studio</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <nav className="md:hidden flex flex-col border-b border-line/70 sticky top-0 bg-ivory/95 z-20">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="w-7 h-7 rounded-full bg-sage text-white flex items-center justify-center text-xs">SB</span>
            <span className="font-semibold text-sm">Gency</span>
          </div>
          {sections.map((section) => {
            const active = path.startsWith(`/admin/${section.name}`);
            return (
              <NavLink
                key={section.name}
                to={`/admin/${section.name}`}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition',
                  active
                    ? 'bg-sage/15 text-sagedeep'
                    : 'text-muted hover:bg-ivory/70 hover:text-charcoal',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <section.icon size={18} className="shrink-0" aria-hidden="true" />
                {section.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex-1 flex flex-col min-h-0">
          <header className="md:hidden flex items-center justify-between border-b border-line/70 h-16 px-4 bg-ivory">
            <p className="text-sm font-semibold">Gency Bookings</p>
            <NavLink to="/" className="text-xs font-semibold text-sage hover:text-sagedeep">View website</NavLink>
          </header>
          <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
