import { cn } from '../../lib/format';

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-ivory border border-line flex items-center justify-center text-sage mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
      {description ? <p className="text-sm text-muted mt-1 max-w-sm">{description}</p> : null}
      {action}
    </div>
  );
}
