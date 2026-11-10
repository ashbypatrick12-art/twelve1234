import { cn } from '../../lib/format';

export function Kbd({ children, className }) {
  return <kbd className={cn('kbd', className)}>{children}</kbd>;
}
