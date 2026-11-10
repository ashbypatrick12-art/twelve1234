import { cn } from '../../lib/format';

export function SectionTitle({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={cn('section-title', align === 'center' ? 'section-title--center' : '')}>
      {eyebrow ? <p className="section-title__eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title__title">{title}</h2>
      {description ? <p className="section-title__description">{description}</p> : null}
    </div>
  );
}
