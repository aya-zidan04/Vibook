import type { CSSProperties } from 'react';

export function Skeleton({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`vb-skeleton ${className}`.trim()} style={style} aria-hidden />;
}

export function StatCardSkeleton() {
  return (
    <div className="vb-stat-card">
      <Skeleton className="vb-stat-card__sk-icon" style={{ width: 44, height: 44, borderRadius: 'var(--vb-radius-md)' }} />
      <Skeleton style={{ height: 14, width: '45%', marginBottom: 8 }} />
      <Skeleton style={{ height: 28, width: '35%' }} />
      <Skeleton style={{ height: 12, width: '70%', marginTop: 8 }} />
    </div>
  );
}
