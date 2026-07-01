import { useMemo } from 'react';
import type { AppRoute } from '@/config/roleAccess';
import { canAccessRoute } from '@/config/roleAccess';
import {
  canPerform,
  getModuleAccess,
  getModuleAccessForRoute,
  getReportIdsForRole,
  isViewOnlyModule,
  type AppModule,
  type Permission,
} from '@/config/rolePermissions';
import { useAuth } from '@/hooks/useAuth';

export function usePermission() {
  const { user } = useAuth();

  return useMemo(() => {
    const role = user?.role;

    return {
      role: role ?? null,
      can: (permission: Permission) => (role ? canPerform(role, permission) : false),
      canRoute: (path: string) => (role ? canAccessRoute(role, path) : false),
      moduleAccess: (module: AppModule) =>
        role ? getModuleAccess(role, module) : ('none' as const),
      isViewOnly: (module: AppModule) => (role ? isViewOnlyModule(role, module) : false),
      routeAccess: (path: AppRoute) =>
        role ? getModuleAccessForRoute(role, path) : ('none' as const),
      reportIds: role ? getReportIdsForRole(role) : [],
    };
  }, [user?.role]);
}
