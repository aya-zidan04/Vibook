import type { TimeSeriesPointResponse } from '@/api/types';

/** Sum `count` over the last `days` points (series is assumed chronological). */
export function sumLastDays(points: TimeSeriesPointResponse[] | undefined, days: number): number {
  const list = points ?? [];
  if (!list.length || days <= 0) return 0;
  return list.slice(-days).reduce((acc, p) => acc + (p?.count ?? 0), 0);
}
