import type { BusinessProfileStatus } from '@/api/types';

const FILTERS: Array<'ALL' | BusinessProfileStatus> = [
  'ALL',
  'PENDING_REVIEW',
  'APPROVED',
  'REJECTED',
  'DRAFT',
];

const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  ALL: 'All',
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  DRAFT: 'Draft',
};

export function BusinessProfileFilterBar({
  value,
  onChange,
}: {
  value: 'ALL' | BusinessProfileStatus;
  onChange: (v: 'ALL' | BusinessProfileStatus) => void;
}) {
  return (
    <div className="vb-filters">
      <div className="vb-chip-group" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={value === f}
            className={`vb-chip ${value === f ? 'vb-chip--active' : ''}`.trim()}
            onClick={() => onChange(f)}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>
    </div>
  );
}
