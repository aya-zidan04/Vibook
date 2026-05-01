import { Link } from 'react-router-dom';
import { IconChevronRight } from '@/components/ui/icons';

export function DashboardHero({
  firstName,
  pendingCount,
  approvalRatePercent,
  newUsers7d,
}: {
  firstName: string;
  pendingCount: number;
  approvalRatePercent: number;
  newUsers7d: number;
}) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="vb-dashboard-hero vb-animate-in">
      <div className="vb-dashboard-hero__main">
        <p className="vb-dashboard-hero__eyebrow">{today}</p>
        <h1 className="vb-dashboard-hero__title">Welcome back, {firstName}</h1>
        <p className="vb-dashboard-hero__lede">
          Signups, reviews, and directory health — one calm overview for your team.
        </p>
      </div>
      <div className="vb-dashboard-hero__aside">
        <div className="vb-dashboard-hero__metrics" role="group" aria-label="Key metrics">
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{pendingCount}</span>
            <span className="vb-dashboard-hero__metric-label">Pending review</span>
          </div>
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{approvalRatePercent}%</span>
            <span className="vb-dashboard-hero__metric-label">Approval rate</span>
          </div>
          <div className="vb-dashboard-hero__metric">
            <span className="vb-dashboard-hero__metric-value">{newUsers7d}</span>
            <span className="vb-dashboard-hero__metric-label">New users (7d)</span>
          </div>
        </div>
        <Link to="/business-profiles" className="vb-dashboard-hero__cta">
          {pendingCount > 0 ? `Review ${pendingCount} in queue` : 'Business profiles'}
          <IconChevronRight />
        </Link>
      </div>
    </header>
  );
}
