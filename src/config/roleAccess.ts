import type { UserRole } from '@/types';

export type AppRoute =
  | '/dashboard'
  | '/inventory'
  | '/ai-recognition'
  | '/procurement'
  | '/suppliers'
  | '/batches'
  | '/reports'
  | '/inspections'
  | '/manual-review'
  | '/reorder-alerts'
  | '/users'
  | '/audit-log'
  | '/profile';

const ROLE_ROUTES: Record<UserRole, AppRoute[]> = {
  'System Administrator': [
    '/dashboard',
    '/users',
    '/audit-log',
  ],
  'Quality Assurance Manager': [
    '/dashboard',
    '/ai-recognition',
    '/manual-review',
    '/inspections',
    '/reports',
  ],
  'Inventory Manager': [
    '/dashboard',
    '/inventory',
    '/batches',
    '/suppliers',
    '/reorder-alerts',
    '/reports',
  ],
  'Purchasing Officer': [
    '/dashboard',
    '/procurement',
    '/reorder-alerts',
    '/suppliers',
    '/reports',
  ],
};

export const ROLE_DEFAULT_ROUTE: Record<UserRole, AppRoute> = {
  'System Administrator': '/dashboard',
  'Quality Assurance Manager': '/manual-review',
  'Inventory Manager': '/inventory',
  'Purchasing Officer': '/procurement',
};

export function getRoutesForRole(role: UserRole): AppRoute[] {
  return ROLE_ROUTES[role] ?? ['/dashboard'];
}

export function getDefaultRouteForRole(role: UserRole): AppRoute {
  return ROLE_DEFAULT_ROUTE[role] ?? '/dashboard';
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  if (path === '/profile' || path.startsWith('/profile/')) {
    return true;
  }
  const allowed = getRoutesForRole(role);
  return allowed.some((route) => path === route || path.startsWith(`${route}/`));
}
