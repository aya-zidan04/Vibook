import type { BusinessProfileStatus } from '@/api/types';
import { useAdminI18n } from '@/i18n/useAdminI18n';

const FILTERS: Array<'ALL' | BusinessProfileStatus> = [
  'ALL',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
];

const FILTER_KEY: Record<(typeof FILTERS)[number], string> = {
  ALL: 'businessProfileFilters.all',
  PENDING_REVIEW: 'businessProfileFilters.pendingReview',
  APPROVED: 'businessProfileFilters.approved',
  REJECTED: 'businessProfileFilters.rejected',
};

export function BusinessProfileFilterBar({
  value,
  onChange,
}: {
  value: 'ALL' | BusinessProfileStatus;
  onChange: (v: 'ALL' | BusinessProfileStatus) => void;
}) {
  const { t } = useAdminI18n();

  return (
    <div className="vb-filters">
      <div className="vb-chip-group" role="tablist" aria-label={t('filters.filterByStatus')}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={value === f}
            className={`vb-chip ${value === f ? 'vb-chip--active' : ''}`.trim()}
            onClick={() => onChange(f)}
          >
            {t(FILTER_KEY[f])}
          </button>
        ))}
      </div>
    </div>
  );
}
