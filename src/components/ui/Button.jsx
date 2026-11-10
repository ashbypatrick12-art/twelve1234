import { cn } from '../../lib/format';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
        'active:scale-[0.98]',
        'disabled:opacity-40 disabled:pointer-events-none',
        Object.entries({
          'bg-ivory text-charcoal border border-charcoal/10 hover:bg-white hover:shadow-soft':
            variant === 'ghost',
          'bg-charcoal text-white hover:bg-charcoal/90':
            variant === 'primary',
          'bg-ivory text-charcoal border border-ivory hover:bg-white hover:shadow-soft':
            variant === 'secondary',
          'bg-sage text-white hover:bg-sagedeep':
            variant === 'accent',
          'w-11 h-11': size === 'icon',
          'px-5 py-3': size === 'sm',
          'px-6 py-3.5': size === 'md',
          'px-7 py-4': size === 'lg',
          'text-sm': size === 'sm' || size === 'icon',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        }).filter(([, enabled]) => enabled).map(([classes]) => classes).join(' '),
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
