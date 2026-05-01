import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <article className="vb-stat-card">
      <div className="vb-stat-card__top">
        <div>
          <p className="vb-stat-card__label">{label}</p>
          <p className="vb-stat-card__value">{value}</p>
        </div>
        <div className="vb-stat-card__icon" aria-hidden>
          {icon}
        </div>
      </div>
      {hint ? <p className="vb-stat-card__hint">{hint}</p> : null}
    </article>
  );
}
