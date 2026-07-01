import type { AppRoute } from '@/config/roleAccess';
import type { UserRole } from '@/types';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Building2,
  ClipboardList,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Package,
  ScanSearch,
  Shield,
  ShoppingCart,
  Users,
  ScrollText,
  User,
} from 'lucide-react';

export type NavSection = {
  title: string;
  items: NavItemConfig[];
};

export type NavItemConfig = {
  label: string;
  path: AppRoute;
  icon: LucideIcon;
  description?: string;
};

const NAV: Record<AppRoute, Omit<NavItemConfig, 'path'>> = {
  '/dashboard': { label: 'Dashboard', icon: LayoutDashboard },
  '/users': { label: 'User Management', icon: Users },
  '/audit-log': { label: 'Activity Logs', icon: ScrollText },
  '/reports': { label: 'Reports', icon: FileBarChart },
  '/ai-recognition': {
    label: 'Tile Recognition Monitoring',
    icon: ScanSearch,
    description: 'Monitor YOLOv8 outputs from mobile scans',
  },
  '/inspections': { label: 'Inspection Records', icon: FileText },
  '/manual-review': { label: 'Manual Review Queue', icon: Shield },
  '/inventory': { label: 'Inventory Management', icon: Package },
  '/batches': { label: 'Batch Monitoring', icon: ClipboardList },
  '/reorder-alerts': { label: 'Reorder Alerts', icon: AlertTriangle },
  '/procurement': { label: 'Procurement Support', icon: ShoppingCart },
  '/suppliers': { label: 'Supplier Management', icon: Building2 },
  '/profile': { label: 'Profile', icon: User },
};

const ROLE_NAVIGATION: Record<UserRole, NavSection[]> = {
  'System Administrator': [
    {
      title: 'Administration',
      items: [
        { path: '/dashboard', ...NAV['/dashboard'] },
        { path: '/users', ...NAV['/users'] },
        { path: '/audit-log', ...NAV['/audit-log'] },
      ],
    },
  ],
  'Quality Assurance Manager': [
    {
      title: 'Quality Assurance',
      items: [
        { path: '/dashboard', ...NAV['/dashboard'] },
        { path: '/ai-recognition', ...NAV['/ai-recognition'] },
        { path: '/inspections', ...NAV['/inspections'] },
        { path: '/manual-review', ...NAV['/manual-review'] },
        { path: '/reports', label: 'Quality Reports', icon: FileBarChart },
      ],
    },
  ],
  'Inventory Manager': [
    {
      title: 'Warehouse Inventory',
      items: [
        { path: '/dashboard', ...NAV['/dashboard'] },
        { path: '/inventory', ...NAV['/inventory'] },
        { path: '/batches', ...NAV['/batches'] },
        { path: '/suppliers', ...NAV['/suppliers'] },
        { path: '/reorder-alerts', ...NAV['/reorder-alerts'] },
        { path: '/reports', label: 'Inventory Reports', icon: FileBarChart },
      ],
    },
  ],
  'Purchasing Officer': [
    {
      title: 'Procurement',
      items: [
        { path: '/dashboard', ...NAV['/dashboard'] },
        { path: '/procurement', label: 'Purchase Requisitions', icon: ShoppingCart },
        { path: '/suppliers', ...NAV['/suppliers'] },
        { path: '/reorder-alerts', ...NAV['/reorder-alerts'] },
        { path: '/reports', label: 'Procurement Reports', icon: FileBarChart },
      ],
    },
  ],
};

export function getNavigationForRole(role: UserRole): NavSection[] {
  return ROLE_NAVIGATION[role] ?? ROLE_NAVIGATION['System Administrator'];
}

export function getReportsTitleForRole(role: UserRole): string {
  switch (role) {
    case 'Quality Assurance Manager':
      return 'Quality Reports';
    case 'Inventory Manager':
      return 'Inventory Reports';
    case 'Purchasing Officer':
      return 'Procurement Reports';
    default:
      return 'Reports and Analytics';
  }
}

export function getDashboardSubtitleForRole(role: UserRole): string {
  switch (role) {
    case 'System Administrator':
      return 'System oversight — user management and activity logs.';
    case 'Quality Assurance Manager':
      return 'Review AI recognition outputs and inspection decisions from the mobile warehouse app.';
    case 'Inventory Manager':
      return 'Monitor stock levels, batches, and reorder thresholds across warehouse inventory.';
    case 'Purchasing Officer':
      return 'Manage procurement, suppliers, and purchase requisition approvals.';
    default:
      return 'TileVision management portal.';
  }
}
