import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchActivityLog, fetchAnalyticsSummary } from '@/api/adminApi';
import type { AdminActivityLogResponse } from '@/api/types';
import { activityActionLabel } from '@/utils/activityLogLabel';
import { formatDateTime } from '@/utils/format';
import { IconBell } from '@/components/ui/icons';

const INTERESTING = new Set<string>([
  'APPROVE_BUSINESS_PROFILE',
  'REJECT_BUSINESS_PROFILE',
  'BULK_APPROVE_BUSINESS_PROFILES',
  'BULK_REJECT_BUSINESS_PROFILES',
  'UPDATE_USER_ROLES',
  'DISABLE_USER',
]);

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminActivityLogResponse[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const [logPage, summary] = await Promise.all([
        fetchActivityLog({ page: 0, size: 24 }),
        fetchAnalyticsSummary(),
      ]);
      setItems(logPage.content.filter((e) => INTERESTING.has(e.action)));
      setPendingCount(summary.pendingBusinessProfiles);
    } catch {
      /* ignore — bell stays usable */
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 120_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const badge = pendingCount > 0 ? (pendingCount > 99 ? '99+' : String(pendingCount)) : null;

  return (
    <div className="vb-notify" ref={rootRef}>
      <button
        type="button"
        className="vb-notify__trigger vb-interactive"
        aria-expanded={open}
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <IconBell />
        {badge ? <span className="vb-notify__badge">{badge}</span> : null}
      </button>
      {open ? (
        <div className="vb-notify__panel vb-animate-in" role="menu">
          <div className="vb-notify__panel-head">
            <strong>Notifications</strong>
            {pendingCount > 0 ? (
              <span className="vb-notify__pill">
                {pendingCount} pending {pendingCount === 1 ? 'review' : 'reviews'}
              </span>
            ) : null}
          </div>
          {pendingCount > 0 ? (
            <Link className="vb-notify__cta" to="/business-profiles" onClick={() => setOpen(false)}>
              Open review queue →
            </Link>
          ) : null}
          <ul className="vb-notify__list">
            {items.length === 0 ? (
              <li className="vb-notify__empty">You’re all caught up.</li>
            ) : (
              items.map((e) => (
                <li key={e.id} className="vb-notify__item">
                  <div className="vb-notify__item-title">{activityActionLabel(e.action)}</div>
                  <div className="vb-notify__item-meta">
                    {e.adminEmail} · {formatDateTime(e.createdAt)}
                  </div>
                </li>
              ))
            )}
          </ul>
          <Link className="vb-notify__footer" to="/activity-log" onClick={() => setOpen(false)}>
            Full activity log
          </Link>
        </div>
      ) : null}
    </div>
  );
}
