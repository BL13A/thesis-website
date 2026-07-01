import { getRoutesForRole, type AppRoute } from '@/config/roleAccess';
import type { UserRole } from '@/types';

export type AppModule =
  | 'inventory'
  | 'ai-recognition'
  | 'procurement'
  | 'suppliers'
  | 'batches'
  | 'reports'
  | 'users'
  | 'inspections';

export type ModuleAccess = 'full' | 'view-only' | 'none';

export type Permission =
  | 'inspections:qa-approve'
  | 'inventory:add'
  | 'inventory:update'
  | 'inventory:export'
  | 'procurement:create'
  | 'procurement:approve-draft'
  | 'procurement:complete'
  | 'suppliers:add'
  | 'suppliers:edit'
  | 'suppliers:view-details'
  | 'users:manage';

const ROUTE_MODULE: Record<AppRoute, AppModule | null> = {
  '/dashboard': null,
  '/inventory': 'inventory',
  '/ai-recognition': 'ai-recognition',
  '/procurement': 'procurement',
  '/suppliers': 'suppliers',
  '/batches': 'batches',
  '/reports': 'reports',
  '/inspections': 'inspections',
  '/manual-review': 'inspections',
  '/reorder-alerts': 'procurement',
  '/users': 'users',
  '/audit-log': null,
  '/profile': null,
};

const MODULE_ACCESS: Record<UserRole, Partial<Record<AppModule, ModuleAccess>>> = {
  'System Administrator': {
    inventory: 'full',
    'ai-recognition': 'full',
    procurement: 'full',
    suppliers: 'full',
    batches: 'full',
    users: 'full',
    inspections: 'full',
  },
  'Quality Assurance Manager': {
    'ai-recognition': 'view-only',
    inspections: 'full',
    reports: 'full',
    suppliers: 'view-only',
  },
  'Inventory Manager': {
    inventory: 'full',
    batches: 'full',
    suppliers: 'view-only',
    reports: 'full',
    procurement: 'view-only',
    'ai-recognition': 'view-only',
  },
  'Purchasing Officer': {
    procurement: 'full',
    suppliers: 'full',
    reports: 'full',
    inventory: 'view-only',
  },
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'System Administrator': [
    'users:manage',
    'inspections:qa-approve',
    'inventory:add',
    'inventory:update',
    'inventory:export',
    'procurement:create',
    'procurement:approve-draft',
    'procurement:complete',
    'suppliers:add',
    'suppliers:edit',
    'suppliers:view-details',
  ],
  'Quality Assurance Manager': ['inspections:qa-approve', 'suppliers:view-details'],
  'Inventory Manager': [
    'inventory:add',
    'inventory:update',
    'inventory:export',
    'suppliers:view-details',
  ],
  'Purchasing Officer': [
    'procurement:create',
    'procurement:approve-draft',
    'procurement:complete',
    'suppliers:add',
    'suppliers:edit',
    'suppliers:view-details',
  ],
};

export const ROLE_REPORT_IDS: Record<UserRole, string[] | 'all'> = {
  'System Administrator': [],
  'Quality Assurance Manager': ['recognition-logs', 'inspections'],
  'Inventory Manager': ['inventory', 'low-stock', 'stock-movement', 'recognition-logs', 'suppliers'],
  'Purchasing Officer': ['procurement', 'low-stock', 'suppliers'],
};

export function routeToModule(path: AppRoute): AppModule | null {
  return ROUTE_MODULE[path];
}

export function getModuleAccess(role: UserRole, module: AppModule): ModuleAccess {
  return MODULE_ACCESS[role]?.[module] ?? 'none';
}

export function getModuleAccessForRoute(role: UserRole, path: AppRoute): ModuleAccess {
  const module = routeToModule(path);
  if (!module) return 'full';
  return getModuleAccess(role, module);
}

export function isViewOnlyModule(role: UserRole, module: AppModule): boolean {
  return getModuleAccess(role, module) === 'view-only';
}

export function canPerform(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canViewReports(role: UserRole): boolean {
  const ids = ROLE_REPORT_IDS[role];
  return ids === 'all' || (Array.isArray(ids) && ids.length > 0);
}

export function getReportIdsForRole(role: UserRole): string[] | 'all' {
  return ROLE_REPORT_IDS[role] ?? [];
}

export const ALL_USER_ROLES: UserRole[] = [
  'System Administrator',
  'Quality Assurance Manager',
  'Inventory Manager',
  'Purchasing Officer',
];

export const MODULE_LABELS: Record<AppModule, string> = {
  inventory: 'Warehouse Inventory',
  'ai-recognition': 'Tile Recognition Monitoring',
  procurement: 'Procurement Support',
  suppliers: 'Supplier Management',
  batches: 'Batch Monitoring',
  reports: 'Reports and Analytics',
  users: 'User Management',
  inspections: 'Inspection Records',
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  'inspections:qa-approve': 'QA Approve / Reject',
  'inventory:add': 'Add Inventory',
  'inventory:update': 'Update Stock',
  'inventory:export': 'Export Inventory',
  'procurement:create': 'Generate Purchase Requisition',
  'procurement:approve-draft': 'Approve Draft PR',
  'procurement:complete': 'Mark PR Completed',
  'suppliers:add': 'Add Supplier',
  'suppliers:edit': 'Edit Supplier',
  'suppliers:view-details': 'View Supplier Details',
  'users:manage': 'Manage Users',
};

const MODULE_ROUTE: Record<AppModule, AppRoute> = {
  inventory: '/inventory',
  'ai-recognition': '/ai-recognition',
  procurement: '/procurement',
  suppliers: '/suppliers',
  batches: '/batches',
  reports: '/reports',
  users: '/users',
  inspections: '/inspections',
};

export type AccessCell = 'full' | 'view-only' | 'none';

export function getModuleAccessCell(role: UserRole, module: AppModule): AccessCell {
  const routes = getRoutesForRole(role);
  const route = MODULE_ROUTE[module];
  if (!routes.includes(route)) return 'none';
  return getModuleAccess(role, module);
}

export function getAllPermissions(): Permission[] {
  const set = new Set<Permission>();
  for (const perms of Object.values(ROLE_PERMISSIONS)) {
    for (const p of perms) set.add(p);
  }
  return Array.from(set);
}
