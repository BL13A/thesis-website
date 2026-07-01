import { Shield, UserCog, Warehouse, ShoppingCart, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleDisplayLabel } from '@/utils/roles';
import type { AccountRole, UserRole } from '@/types';

type RoleStyle = { icon: LucideIcon; bg: string; text: string; border: string };

const ROLE_STYLES: Record<UserRole, RoleStyle> = {
  'System Administrator': {
    icon: UserCog,
    bg: 'rgba(250, 204, 21, 0.12)',
    text: '#facc15',
    border: 'rgba(250, 204, 21, 0.25)',
  },
  'Quality Assurance Manager': {
    icon: Shield,
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  'Inventory Manager': {
    icon: Warehouse,
    bg: 'rgba(250, 204, 21, 0.1)',
    text: '#facc15',
    border: 'rgba(250, 204, 21, 0.2)',
  },
  'Purchasing Officer': {
    icon: ShoppingCart,
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.25)',
  },
};

const MOBILE_ROLE_STYLES: Record<string, RoleStyle> = {
  'Warehouse Personnel': {
    icon: Warehouse,
    bg: 'rgba(16, 185, 129, 0.12)',
    text: '#34d399',
    border: 'rgba(16, 185, 129, 0.25)',
  },
};

const DEFAULT_STYLE: RoleStyle = {
  icon: Smartphone,
  bg: 'rgba(148, 163, 184, 0.12)',
  text: '#94a3b8',
  border: 'rgba(148, 163, 184, 0.25)',
};

function getRoleStyle(role: AccountRole): RoleStyle {
  return ROLE_STYLES[role as UserRole] ?? MOBILE_ROLE_STYLES[role] ?? DEFAULT_STYLE;
}

interface RoleBadgeProps {
  role: AccountRole;
  size?: 'sm' | 'md';
  className?: string;
}

export function RoleBadge({ role, size = 'md', className }: RoleBadgeProps) {
  const style = getRoleStyle(role);
  const Icon = style.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className,
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border,
      }}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={2} />
      {getRoleDisplayLabel(role)}
    </span>
  );
}
