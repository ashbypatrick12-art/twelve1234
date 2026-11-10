import {
  CalendarCheck,
  CalendarDays,
  Clock3,
  LayoutDashboard,
  Scissors,
  Sparkles,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/format';

const sections = [
  { name: 'overview', icon: LayoutDashboard, label: 'Overview', description: 'Your studio at a glance' },
  { name: 'bookings', icon: CalendarCheck, label: 'Bookings', description: 'Manage appointments' },
  { name: 'calendar', icon: CalendarDays, label: 'Calendar', description: 'See your schedule' },
  { name: 'services', icon: Scissors, label: 'Services', description: 'Manage your treatments' },
  { name: 'availability', icon: Clock3, label: 'Availability', description: 'Set hours and time slots' },
  { name: 'customers', icon: Users, label: 'Customers', description: 'Customer records' },
];

export function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const current = sections.find((section) => pathname === `/admin/${section.name}`) || sections[0];
  const PageIcon = current.icon;

  return (
    <div className="min-h-screen bg-[#f5f6f2] text-[#252a25] md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-[252px] md:shrink-0 md:flex-col border-r border-[#e5e8df] bg-white">
        <div className="flex h-[82px] items-center gap-3 border-b border-[#edf0e9] px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#40513d] text-white shadow-sm">
            <Sparkles size={19} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#252a25]">Gency Bookings</p>
            <p className="mt-0.5 text-[11px] text-[#899184]">Serene Beauty Studio</p>
          </div>
        </div>

        <div className="px-5 pb-2 pt-8">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a79b]">Workspace</p>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <NavLink
                key={section.name}
                to={`/admin/${section.name}`}
                className={({ isActive }) => cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#edf1e9] text-[#354532] shadow-[inset_3px_0_0_#65785d]'
                    : 'text-[#778074] hover:bg-[#f6f7f3] hover:text-[#303a2e]',
                )}
                aria-label={section.label}
              >
                <Icon size={18} strokeWidth={1.8} className="block shrink-0" aria-hidden="true" />
                <span>{section.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl border border-[#edf0e9] bg-[#f8f9f6] p-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dfe7d9] text-xs font-semibold text-[#40513d]">SB</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#394236]">Serene Beauty Studio</p>
              <p className="mt-0.5 text-[10px] text-[#92998d]">Studio workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-[#e5e8df] bg-white/95 backdrop-blur-md">
          <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf1e9] text-[#40513d] md:hidden">
                <PageIcon size={17} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[#252a25] md:text-[15px]">{current.label}</p>
                <p className="hidden text-[11px] text-[#92998d] sm:block">{current.description}</p>
              </div>
            </div>
            <a
              href="/"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#e5e8df] bg-white px-3 py-2 text-[11px] font-semibold text-[#586451] transition hover:border-[#cbd5c3] hover:bg-[#f8f9f6] sm:px-3.5 sm:text-xs"
            >
              View website
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>

          <nav aria-label="Mobile admin navigation" className="flex gap-1 overflow-x-auto border-t border-[#f0f2ed] px-3 py-2 md:hidden">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <NavLink
                  key={section.name}
                  to={`/admin/${section.name}`}
                  className={({ isActive }) => cn(
                    'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[11px] font-semibold transition',
                    isActive
                      ? 'bg-[#40513d] text-white'
                      : 'text-[#788174] hover:bg-[#f3f5f0] hover:text-[#354532]',
                  )}
                >
                  <Icon size={15} strokeWidth={1.9} className="block shrink-0" aria-hidden="true" />
                  {section.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        <main className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-9 lg:py-9">
          <div className="mx-auto w-full max-w-[1440px] animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
