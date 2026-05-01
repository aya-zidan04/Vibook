import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  children,
  className = '',
  padding = 'lg',
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'md' | 'lg';
}) {
  const p =
    padding === 'none' ? '' : padding === 'md' ? 'vb-card--pad-md' : 'vb-card--pad-lg';
  return (
    <div className={`vb-card ${p} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="vb-card__header">
      <div>
        <h2 className="vb-card__title">{title}</h2>
        {subtitle ? <p className="vb-card__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="vb-card__action">{action}</div> : null}
    </div>
  );
}
