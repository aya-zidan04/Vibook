import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { AdminChromeProvider } from '@/components/layout/AdminChromeProvider';
import { VibookBrandMark } from '@/components/branding/VibookBrandMark';
import { Button } from '@/components/ui/Button';
import {
  IconBriefcase,
  IconCalendar,
  IconFlag,
  IconLayout,
  IconMap,
  IconSettings,
  IconStar,
  IconTag,
  IconTicket,
  IconUsers,
} from '@/components/ui/icons';
import { useAdminI18n } from '@/i18n/useAdminI18n';
import { routeTitle } from '@/utils/pageTitle';

const nav = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: IconLayout },
  { to: '/business-profiles', labelKey: 'nav.businessProfiles', icon: IconBriefcase },
  { to: '/users', labelKey: 'nav.users', icon: IconUsers },
  { to: '/events', labelKey: 'nav.events', icon: IconTicket },
  { to: '/bookings', labelKey: 'nav.bookings', icon: IconCalendar },
  { to: '/ratings', labelKey: 'nav.ratings', icon: IconStar },
  { to: '/reports', labelKey: 'nav.reports', icon: IconFlag },
  { to: '/categories', labelKey: 'nav.categories', icon: IconTag },
  { to: '/governorates', labelKey: 'nav.governorates', icon: IconMap },
  { to: '/settings', labelKey: 'nav.settings', icon: IconSettings },
];

function ShellInner() {
  const location = useLocation();
  const title = routeTitle(location.pathname);
  const { user, logout } = useAuth();
  const { t } = useAdminI18n();

  return (
    <div className="vb-shell vb-page-bg">
      <aside className="vb-sidebar" aria-label={t('common.openNav')}>
        <div className="vb-sidebar__brand">
          <div className="vb-sidebar__logo">
            <VibookBrandMark size={52} label="" />
          </div>
          <div className="vb-sidebar__titles">
            <h1>{t('brand.name')}</h1>
            <p>{t('brand.console')}</p>
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
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="vb-main">
        <header className="vb-topbar">
          <div className="vb-topbar__title-block">
            <h2>{title}</h2>
            <p>{t('brand.tagline')}</p>
          </div>
          <div className="vb-topbar__right">
            <div className="vb-user-pill">
              <span className="vb-user-pill__name">
                {user ? `${user.firstName} ${user.lastName}`.trim() : t('common.admin')}
              </span>
              <span className="vb-user-pill__email" title={user?.email} dir="ltr">
                {user?.email ?? ''}
              </span>
            </div>
            <Button variant="dangerOutline" size="sm" onClick={logout}>
              {t('common.logout')}
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
