import { cn } from '../../lib/format';

export function Badge({ children, variant = 'grey' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        variant === 'sage' ? 'bg-sage text-sagedeep' : variant === 'white' ? 'bg-white text-charcoal border border-line' : 'bg-charcoal/5 text-charcoal',
      )}
    >
      {children}
    </span>
  );
}
