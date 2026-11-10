import { cn } from '../../lib/format';

export function Card({ className, children, padding = true }) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-line/70 shadow-soft',
        padding ? 'p-5 sm:p-7' : '',
        className,
      )}
    >
      {children}
    </div>
  );
}
