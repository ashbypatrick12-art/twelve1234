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
    <div className="admin-shell min-h-screen flex bg-ivory font-sans text-charcoal">
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
        <nav aria-label="Admin navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sections.map((section) => {
            const active = path.startsWith(`/admin/${section.name}`);
            return (
              <NavLink key={section.name} to={`/admin/${section.name}`}
                className={cn('flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition',
                  active ? 'bg-charcoal/5 text-charcoal shadow-soft' : 'text-muted hover:bg-ivory/60 hover:text-charcoal')}
                aria-current={active ? 'page' : undefined}>
                <section.icon size={18} className="shrink-0" aria-hidden="true" />
                {section.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5 px-3 py-4 border-t border-line/70">
          <div className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center text-sm font-bold">SB</div>
          <p className="text-sm font-medium truncate">Serene Beauty Studio</p>
        </div>
      </aside>

      <div className="admin-main flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-ivory/95 backdrop-blur border-b border-line/70">
          <div className="h-14 px-4 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-sage text-white flex items-center justify-center text-xs font-bold">SB</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">Gency Bookings</p>
              <p className="text-[11px] text-muted leading-tight">Serene Beauty Studio</p>
            </div>
          </div>
          <nav aria-label="Admin navigation" className="admin-mobile-nav flex items-center gap-1 px-3 pb-2 overflow-x-auto">
            {sections.map((section) => {
              const active = path.startsWith(`/admin/${section.name}`);
              return (
                <NavLink key={section.name} to={`/admin/${section.name}`}
                  className={cn('shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition',
                    active ? 'bg-sage/20 text-sagedeep' : 'text-muted hover:bg-white hover:text-charcoal')}
                  aria-current={active ? 'page' : undefined}>
                  <section.icon size={15} className="shrink-0" aria-hidden="true" />
                  {section.label}
                </NavLink>
              );
            })}
          </nav>
        </header>
        <main className="admin-content flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
