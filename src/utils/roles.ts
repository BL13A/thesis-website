import type { AccountRole, UserRole } from '@/types';

/** Management portal roles (thesis scope). */
export const WEB_MANAGEMENT_ROLES: UserRole[] = [
  'System Administrator',
  'Quality Assurance Manager',
  'Inventory Manager',
  'Purchasing Officer',
];

/** Mobile warehouse app role. */
export const MOBILE_APP_ROLES = ['Warehouse Personnel'] as const satisfies readonly AccountRole[];

/** All system roles — warehouse, system admin, QA, inventory, purchasing. */
export const ALL_ACCOUNT_ROLES: AccountRole[] = [
  'Warehouse Personnel',
  'System Administrator',
  'Quality Assurance Manager',
  'Inventory Manager',
  'Purchasing Officer',
];

/** Roles administered in web User Management. */
export const MANAGED_ACCOUNT_ROLES: AccountRole[] = [...ALL_ACCOUNT_ROLES];

export const ROLE_DISPLAY_LABELS: Record<AccountRole, string> = {
  'Warehouse Personnel': 'Warehouse Personnel',
  'System Administrator': 'System Admin',
  'Quality Assurance Manager': 'QA',
  'Inventory Manager': 'Inventory',
  'Purchasing Officer': 'Purchasing',
};

const ROLE_ALIASES: Record<string, UserRole> = {
  'Quality Assurance Officer': 'Quality Assurance Manager',
  'System Admin': 'System Administrator',
  QA: 'Quality Assurance Manager',
  Inventory: 'Inventory Manager',
  Purchasing: 'Purchasing Officer',
};

const MOBILE_ONLY_ROLES = new Set<string>(MOBILE_APP_ROLES);

export function normalizeWebRole(role: string): UserRole | null {
  if (MOBILE_ONLY_ROLES.has(role)) {
    return null;
  }
  const aliased = ROLE_ALIASES[role] ?? role;
  if (WEB_MANAGEMENT_ROLES.includes(aliased as UserRole)) {
    return aliased as UserRole;
  }
  return null;
}

export function isWebManagementRole(role: string): boolean {
  return normalizeWebRole(role) !== null;
}

export function webRoleLabel(role: UserRole): string {
  return ROLE_DISPLAY_LABELS[role];
}

export function getRoleDisplayLabel(role: AccountRole | string): string {
  return ROLE_DISPLAY_LABELS[role as AccountRole] ?? role;
}

export function normalizeAccountRole(role: string): AccountRole {
  const aliased = ROLE_ALIASES[role] ?? role;
  if (ALL_ACCOUNT_ROLES.includes(aliased as AccountRole)) {
    return aliased as AccountRole;
  }
  if (role === 'Quality Assurance Officer') {
    return 'Quality Assurance Manager';
  }
  if (role === 'Warehouse Personnel') {
    return 'Warehouse Personnel';
  }
  return aliased as AccountRole;
}

export function getAccountPlatform(role: AccountRole): 'web' | 'mobile' {
  if (MOBILE_ONLY_ROLES.has(role)) {
    return 'mobile';
  }
  return 'web';
}
