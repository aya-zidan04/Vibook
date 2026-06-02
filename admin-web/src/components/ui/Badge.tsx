import type {
  BookingStatus,
  BusinessProfileStatus,
  ModerationReportStatus,
  PaymentStatus,
  UserReportStatus,
} from '@/api/types';
import { useAdminI18n } from '@/i18n/useAdminI18n';

const statusTone: Record<BusinessProfileStatus, string> = {
  DRAFT: 'vb-badge--draft',
  PENDING_REVIEW: 'vb-badge--pending',
  APPROVED: 'vb-badge--approved',
  REJECTED: 'vb-badge--rejected',
};

export function StatusBadge({ status }: { status: BusinessProfileStatus }) {
  const { t } = useAdminI18n();
  const label =
    status === 'PENDING_REVIEW'
      ? t('status.pendingReview')
      : status === 'DRAFT'
        ? t('status.draft')
        : status === 'APPROVED'
          ? t('status.approved')
          : t('status.rejected');
  return <span className={`vb-badge ${statusTone[status]}`}>{label}</span>;
}

export function RoleBadge({ label }: { label: string }) {
  return <span className="vb-badge vb-badge--neutral">{label}</span>;
}

export function EventVisibilityBadge({ status }: { status: string }) {
  const { t } = useAdminI18n();
  const s = status.toUpperCase();
  const hidden = s === 'HIDDEN';
  const draft = s === 'DRAFT';
  const label = draft ? t('status.draft') : hidden ? t('status.hidden') : t('status.visible');
  const cls = draft ? 'vb-badge--pending' : hidden ? 'vb-badge--rejected' : 'vb-badge--approved';
  return <span className={`vb-badge ${cls}`}>{label}</span>;
}

const bookingTone: Record<BookingStatus, string> = {
  PENDING: 'vb-badge--pending',
  CONFIRMED: 'vb-badge--approved',
  COMPLETED: 'vb-badge--neutral',
  CANCELLED: 'vb-badge--rejected',
};

const bookingLabelKey: Record<BookingStatus, string> = {
  PENDING: 'bookingStatus.pending',
  CONFIRMED: 'bookingStatus.confirmed',
  COMPLETED: 'bookingStatus.completed',
  CANCELLED: 'bookingStatus.cancelled',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useAdminI18n();
  return <span className={`vb-badge ${bookingTone[status]}`}>{t(bookingLabelKey[status])}</span>;
}

const paymentTone: Record<PaymentStatus, string> = {
  CREATED: 'vb-badge--pending',
  APPROVED: 'vb-badge--neutral',
  CAPTURED: 'vb-badge--approved',
  FAILED: 'vb-badge--rejected',
  CANCELLED: 'vb-badge--rejected',
};

const paymentLabelKey: Record<PaymentStatus, string> = {
  CREATED: 'paymentStatus.created',
  APPROVED: 'paymentStatus.approved',
  CAPTURED: 'paymentStatus.captured',
  FAILED: 'paymentStatus.failed',
  CANCELLED: 'paymentStatus.cancelled',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { t } = useAdminI18n();
  return <span className={`vb-badge ${paymentTone[status]}`}>{t(paymentLabelKey[status])}</span>;
}

const reportTone: Record<ModerationReportStatus, string> = {
  OPEN: 'vb-badge--pending',
  REVIEWED: 'vb-badge--neutral',
  RESOLVED: 'vb-badge--approved',
  DISMISSED: 'vb-badge--rejected',
};

export function ReportStatusBadge({ status }: { status: ModerationReportStatus }) {
  const { t } = useAdminI18n();
  const label =
    status === 'REVIEWED'
      ? t('status.reviewed')
      : status === 'DISMISSED'
        ? t('status.dismissed')
        : status === 'RESOLVED'
          ? t('status.resolved')
          : t('status.open');
  return <span className={`vb-badge ${reportTone[status]}`}>{label}</span>;
}

const userReportTone: Record<UserReportStatus, string> = {
  OPEN: 'vb-badge--pending',
  IN_PROGRESS: 'vb-badge--neutral',
  RESOLVED: 'vb-badge--approved',
};

export function UserReportStatusBadge({ status }: { status: UserReportStatus }) {
  const { t } = useAdminI18n();
  const label =
    status === 'IN_PROGRESS'
      ? t('status.inProgress')
      : status === 'RESOLVED'
        ? t('status.resolved')
        : t('status.open');
  return <span className={`vb-badge ${userReportTone[status]}`}>{label}</span>;
}
