import type { BookingStatus, BusinessProfileStatus, ModerationReportStatus } from '@/api/types';

const statusTone: Record<BusinessProfileStatus, string> = {
  DRAFT: 'vb-badge--draft',
  PENDING_REVIEW: 'vb-badge--pending',
  APPROVED: 'vb-badge--approved',
  REJECTED: 'vb-badge--rejected',
};

export function StatusBadge({ status }: { status: BusinessProfileStatus }) {
  const label =
    status === 'PENDING_REVIEW'
      ? 'Pending review'
      : status === 'DRAFT'
        ? 'Draft'
        : status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`vb-badge ${statusTone[status]}`}>{label}</span>;
}

export function RoleBadge({ label }: { label: string }) {
  return <span className="vb-badge vb-badge--neutral">{label}</span>;
}

export function EventVisibilityBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const hidden = s === 'HIDDEN';
  const draft = s === 'DRAFT';
  const label = draft ? 'Draft' : hidden ? 'Hidden' : 'Visible';
  const cls = draft ? 'vb-badge--pending' : hidden ? 'vb-badge--rejected' : 'vb-badge--approved';
  return <span className={`vb-badge ${cls}`}>{label}</span>;
}

const bookingTone: Record<BookingStatus, string> = {
  PENDING: 'vb-badge--pending',
  CONFIRMED: 'vb-badge--approved',
  COMPLETED: 'vb-badge--neutral',
  CANCELLED: 'vb-badge--rejected',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`vb-badge ${bookingTone[status]}`}>{label}</span>;
}

const reportTone: Record<ModerationReportStatus, string> = {
  OPEN: 'vb-badge--pending',
  REVIEWED: 'vb-badge--neutral',
  RESOLVED: 'vb-badge--approved',
  DISMISSED: 'vb-badge--rejected',
};

export function ReportStatusBadge({ status }: { status: ModerationReportStatus }) {
  const label =
    status === 'REVIEWED'
      ? 'Reviewed'
      : status === 'DISMISSED'
        ? 'Dismissed'
        : status.charAt(0) + status.slice(1).toLowerCase();
  return <span className={`vb-badge ${reportTone[status]}`}>{label}</span>;
}
