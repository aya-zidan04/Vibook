import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { AdminChromeProvider } from '@/components/layout/AdminChromeProvider';
import { VibookBrandMark } from '@/components/branding/VibookBrandMark';
import { AdminNotificationBell } from '@/components/layout/AdminNotificationBell';
import { Button } from '@/components/ui/Button';
import {
  IconBriefcase,
  IconCalendar,
  IconFlag,
  IconHistory,
  IconLayout,
  IconMap,
  IconSettings,
  IconStar,
  IconTag,
  IconTicket,
  IconUsers,
} from '@/components/ui/icons';
import { routeTitle } from '@/utils/pageTitle';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: IconLayout },
  { to: '/business-profiles', label: 'Business profiles', icon: IconBriefcase },
  { to: '/users', label: 'Users', icon: IconUsers },
  { to: '/events', label: 'Events', icon: IconTicket },
  { to: '/bookings', label: 'Bookings', icon: IconCalendar },
  { to: '/ratings', label: 'Ratings', icon: IconStar },
  { to: '/reports', label: 'Reports', icon: IconFlag },
  { to: '/categories', label: 'Categories', icon: IconTag },
  { to: '/governorates', label: 'Governorates', icon: IconMap },
  { to: '/activity-log', label: 'Activity log', icon: IconHistory },
  { to: '/settings', label: 'Settings', icon: IconSettings },
];

function ShellInner() {
  const location = useLocation();
  const title = routeTitle(location.pathname);
  const { user, logout } = useAuth();

  return (
    <div className="vb-shell vb-page-bg">
      <aside className="vb-sidebar" aria-label="Main navigation">
        <div className="vb-sidebar__brand">
          <div className="vb-sidebar__logo">
            <VibookBrandMark size={52} label="" />
          </div>
          <div className="vb-sidebar__titles">
            <h1>Vibook</h1>
            <p>Admin console</p>
          </div>
        </div>
        <nav className="vb-sidebar__nav">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `vb-sidebar__link ${isActive ? 'vb-sidebar__link--active' : ''}`.trim()
                }
                end={item.to === '/dashboard'}
              >
                <span className="vb-sidebar__icon">
                  <Icon />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="vb-main">
        <header className="vb-topbar">
          <div className="vb-topbar__title-block">
            <h2>{title}</h2>
            <p>Warm experiences, calm operations.</p>
          </div>
          <div className="vb-topbar__right">
            <AdminNotificationBell />
            <div className="vb-user-pill">
              <span className="vb-user-pill__name">
                {user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin'}
              </span>
              <span className="vb-user-pill__email" title={user?.email}>
                {user?.email ?? ''}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <div className="vb-main__scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function DashboardShell() {
  return (
    <AdminChromeProvider>
      <ShellInner />
    </AdminChromeProvider>
  );
}
