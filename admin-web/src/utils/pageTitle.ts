import type { RoleName } from '@/api/types';
import { getAdminLocale } from '@/i18n/localeStore';
import { translations } from '@/i18n/dictionary';

function routeKey(pathname: string): string {
  if (pathname.startsWith('/business-profiles/') && pathname !== '/business-profiles') {
    return 'routes.businessProfile';
  }
  if (pathname.startsWith('/events/') && pathname !== '/events') {
    return 'routes.event';
  }
  if (pathname.startsWith('/bookings/') && pathname !== '/bookings') {
    return 'routes.booking';
  }
  if (pathname.startsWith('/reports/user/')) {
    return 'routes.problemReport';
  }
  if (pathname.startsWith('/reports/') && pathname !== '/reports') {
    return 'routes.report';
  }
  switch (pathname) {
    case '/dashboard':
      return 'routes.dashboard';
    case '/business-profiles':
      return 'routes.businessProfiles';
    case '/users':
      return 'routes.users';
    case '/categories':
      return 'routes.categories';
    case '/governorates':
      return 'routes.governorates';
    case '/events':
      return 'routes.events';
    case '/bookings':
      return 'routes.bookings';
    case '/ratings':
      return 'routes.ratings';
    case '/reports':
      return 'routes.reports';
    case '/settings':
      return 'routes.settings';
    default:
      return 'routes.default';
  }
}

function tPath(path: string, locale: 'en' | 'ar'): string {
  const parts = path.split('.');
  let cur: unknown = translations[locale];
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
}

export function routeTitle(pathname: string): string {
  const locale = getAdminLocale();
  return tPath(routeKey(pathname), locale);
}

const ROLE_DISPLAY_ORDER: RoleName[] = ['ROLE_USER', 'ROLE_BUSINESS', 'ROLE_ADMIN'];

export function formatRoles(roles: RoleName[] | undefined): string {
  const locale = getAdminLocale();
  const dash = locale === 'ar' ? '—' : '—';
  if (!roles?.length) return dash;
  const label = (role: RoleName): string => {
    if (role === 'ROLE_ADMIN') return tPath('users.roleAdmin', locale);
    if (role === 'ROLE_BUSINESS') return tPath('users.roleBusiness', locale);
    if (role === 'ROLE_USER') return tPath('users.roleUser', locale);
    return String(role).replace('ROLE_', '').toLowerCase();
  };
  return ROLE_DISPLAY_ORDER.filter((r) => roles.includes(r))
    .map(label)
    .join(', ');
}
