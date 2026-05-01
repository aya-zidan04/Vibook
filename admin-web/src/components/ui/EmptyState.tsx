import type { ReactNode } from 'react';

function EmptyDecor() {
  return (
    <div className="vb-empty__decor" aria-hidden>
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        <ellipse cx="60" cy="72" rx="44" ry="8" fill="rgba(196, 137, 108, 0.2)" />
        <rect x="28" y="22" width="64" height="44" rx="10" fill="rgba(91, 59, 75, 0.12)" stroke="rgba(196, 137, 108, 0.35)" />
        <circle cx="48" cy="42" r="6" fill="rgba(196, 137, 108, 0.45)" />
        <path d="M58 46h28M58 38h18" stroke="rgba(91, 59, 75, 0.35)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  decor,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Soft inline illustration (brand shapes). */
  decor?: boolean;
}) {
  return (
    <div className={`vb-empty ${decor ? 'vb-empty--with-decor' : ''}`.trim()}>
      {decor ? <EmptyDecor /> : null}
      <h3 className="vb-empty__title">{title}</h3>
      {description ? <p className="vb-empty__desc">{description}</p> : null}
      {action ? <div className="vb-empty__action">{action}</div> : null}
    </div>
  );
}
