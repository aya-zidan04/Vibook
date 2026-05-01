import type { RoleName } from '@/api/types';

export function routeTitle(pathname: string): string {
  if (pathname.startsWith('/business-profiles/') && pathname !== '/business-profiles') {
    return 'Business profile';
  }
  if (pathname.startsWith('/events/') && pathname !== '/events') {
    return 'Event';
  }
  if (pathname.startsWith('/bookings/') && pathname !== '/bookings') {
    return 'Booking';
  }
  if (pathname.startsWith('/reports/') && pathname !== '/reports') {
    return 'Report';
  }
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/business-profiles':
      return 'Business profiles';
    case '/users':
      return 'Users';
    case '/categories':
      return 'Categories';
    case '/governorates':
      return 'Governorates';
    case '/activity-log':
      return 'Activity log';
    case '/events':
      return 'Events';
    case '/bookings':
      return 'Bookings';
    case '/ratings':
      return 'Ratings';
    case '/reports':
      return 'Reports';
    case '/settings':
      return 'Settings';
    default:
      return 'Vibook Admin';
  }
}

export function formatRoles(roles: RoleName[] | undefined): string {
  if (!roles?.length) return '—';
  return roles
    .map((r) => r.replace('ROLE_', '').toLowerCase())
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(', ');
}
