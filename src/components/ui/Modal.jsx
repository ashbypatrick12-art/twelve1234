import { X } from 'lucide-react';
import { cn } from '../../lib/format';

export function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  size = 'md',
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div
        className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-lg rounded-3xl bg-white shadow-lift border border-line',
          'animate-[fade-in_0.25s_ease-out]',
          {
            'sm:max-h-[88vh]': size === 'lg',
            'sm:max-h-[70vh]': size === 'md',
            'sm:max-h-[96vh]': size === 'xl',
          },
        )}
      >
        <div className="flex items-start justify-between border-b border-line/70 p-6 pb-4">
          <div>
            {title ? <h3 className="text-xl font-semibold text-charcoal">{title}</h3> : null}
            {description ? <p className="text-sm text-muted mt-1">{description}</p> : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-ivory text-muted transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 pb-6 pt-3">{children}</div>
        {actions ? (
          <div className="flex justify-end gap-3 px-6 pb-6 pt-2 border-t border-line/70 mt-2">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
