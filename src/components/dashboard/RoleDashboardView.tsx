import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  ClipboardList,
  Package,
  ScrollText,
  Shield,
  ShoppingCart,
  Truck,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardAlertItem } from '@/components/dashboard/DashboardAlertItem';
import { KPICard } from '@/components/KPICard';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDashboardSubtitleForRole } from '@/config/roleNavigation';
import { getRoleDisplayLabel } from '@/utils/roles';
import { useAppData } from '@/hooks/useAppData';
import { formatDate } from '@/lib/utils';
import type { WebDashboardSummary } from '@/services/warehouseDashboardService';
import type { SessionUser, User, UserRole } from '@/types';

const ROLE_KPI_LABELS: Record<Exclude<UserRole, 'System Administrator'>, string[]> = {
  'Quality Assurance Manager': [
    'Pending QA Reviews',
    'Blocked Inventory',
    'Recent AI Scans',
    'Inspection Records',
    'Active Reorder Alerts',
    'Active Suppliers',
  ],
  'Inventory Manager': [
    'Total Tile SKUs',
    'Available Inventory',
    'Blocked Inventory',
    'Active Reorder Alerts',
    'Low Stock Tiles',
    'Recent AI Scans',
  ],
  'Purchasing Officer': [
    'Active Reorder Alerts',
    'Pending Purchase Requests',
    'Active Suppliers',
    'Available Inventory',
    'Low Stock Tiles',
    'Blocked Inventory',
  ],
};

function buildAdminKpis(
  users: User[],
  summary: WebDashboardSummary | null,
  notificationUnread: number,
) {
  const activeUsers = users.filter((item) => item.status === 'Active').length;
  const inactiveUsers = users.filter((item) => item.status !== 'Active').length;
  const roleCount = new Set(users.map((item) => item.role)).size;

  return [
    { label: 'Total Users', value: users.length },
    { label: 'Active Users', value: activeUsers },
    { label: 'Inactive Accounts', value: inactiveUsers },
    { label: 'Management Roles', value: roleCount },
    {
      label: 'Recent Activity',
      value: summary?.recentActivity?.length ?? 0,
    },
    { label: 'System Alerts', value: notificationUnread },
  ];
}

function buildRoleKpis(role: Exclude<UserRole, 'System Administrator'>, summary: WebDashboardSummary) {
  const valueByLabel: Record<string, number> = {
    'Total Tile SKUs': summary.totalTiles,
    'Available Inventory': summary.totalInventoryQuantity,
    'Blocked Inventory': summary.inventoryBlocked ?? 0,
    'Pending QA Reviews': summary.pendingManualReviews ?? 0,
    'Active Reorder Alerts': summary.lowStockCount,
    'Active Suppliers': summary.supplierCount ?? 0,
    'Recent AI Scans': summary.recentRecognitionLogs.length,
    'Low Stock Tiles': summary.lowStockCount,
    'Inspection Records': summary.pendingManualReviews ?? 0,
    'Pending Purchase Requests': summary.pendingPurchaseRequests,
  };
  const labels = ROLE_KPI_LABELS[role];
  return labels.map((label) => ({
    label,
    value: valueByLabel[label] ?? 0,
  }));
}

const KPI_ICONS: LucideIcon[] = [Package, BarChart3, AlertTriangle, Truck, ShoppingCart, ClipboardList];
const ADMIN_KPI_ICONS: LucideIcon[] = [Users, UserCheck, UserMinus, Shield, ScrollText, Bell];
const KPI_GRADIENTS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-violet-500 to-violet-700',
  'from-red-500 to-red-700',
  'from-slate-500 to-slate-700',
];

export function RoleDashboardView({ user }: { user: SessionUser }) {
  const {
    dashboardSummary,
    inspections,
    suppliers,
    users,
    notificationUnread,
    isLoading,
    error,
  } = useAppData();
  const summary = dashboardSummary;
  const isAdmin = user.role === 'System Administrator';

  if (isLoading && !summary && !isAdmin) {
    return <DashboardSkeleton />;
  }

  const kpis = isAdmin
    ? buildAdminKpis(users, summary, notificationUnread)
    : summary
      ? buildRoleKpis(
          user.role as Exclude<UserRole, 'System Administrator'>,
          summary,
        )
      : [];

  const alerts =
    summary?.lowStockTiles.map((tile) => ({
      id: tile.id,
      title: `Low stock: ${tile.name}`,
      description: `${tile.stockQuantity} units remaining (reorder at ${tile.lowStockThreshold})`,
      type: tile.stockQuantity <= 0 ? ('critical' as const) : ('warning' as const),
    })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={getDashboardSubtitleForRole(user.role)}
      />

      {error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi, index) => (
          <KPICard
            key={kpi.label}
            label={kpi.label}
            value={typeof kpi.value === 'number' ? kpi.value : 0}
            displayValue={String(kpi.value)}
            change={0}
            trend="neutral"
            icon={
              isAdmin
                ? ADMIN_KPI_ICONS[index % ADMIN_KPI_ICONS.length]
                : KPI_ICONS[index % KPI_ICONS.length]
            }
            gradient={KPI_GRADIENTS[index % KPI_GRADIENTS.length]}
            index={index}
          />
        ))}
      </div>

      {isAdmin ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <h3 className="mb-2 text-lg font-semibold">User Management</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create, edit, and disable management portal accounts.
            </p>
            <Button asChild size="sm">
              <Link to="/users">Manage Users</Link>
            </Button>
          </div>
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <h3 className="mb-2 text-lg font-semibold">Activity Logs</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Audit recognition, inventory, and procurement activity.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/audit-log">View Logs</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {summary && !isAdmin ? (
        <DashboardCharts summary={summary} inspections={inspections} suppliers={suppliers} />
      ) : null}

      {user.role === 'Inventory Manager' || user.role === 'Purchasing Officer' ? (
        alerts.length > 0 ? (
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Reorder Alerts</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/reorder-alerts">View All</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 6).map((alert, index) => (
                <DashboardAlertItem key={alert.id} alert={alert} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="No reorder alerts"
            description="Inventory levels are above reorder thresholds."
          />
        )
      ) : null}

      {user.role === 'Quality Assurance Manager' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Recent AI Recognition Logs</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/ai-recognition">View Monitoring</Link>
              </Button>
            </div>
            {summary && summary.recentRecognitionLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tile</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.recentRecognitionLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.recognizedName}</TableCell>
                      <TableCell>{log.tileType}</TableCell>
                      <TableCell>{Math.round(log.confidenceScore * 100)}%</TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No recognition logs"
                description="Recognition logs appear when warehouse personnel scan tiles on the mobile application."
              />
            )}
          </div>

          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Manual Review Queue</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/manual-review">Open Queue</Link>
              </Button>
            </div>
            {(summary?.pendingManualReviews ?? 0) > 0 ? (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {summary?.pendingManualReviews ?? 0} inspection record(s) require quality assurance review.
                </p>
                <Button asChild>
                  <Link to="/manual-review">Review Manual Queue</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                icon={Truck}
                title="No pending QA reviews"
                description="Manual review items appear when mobile inspections require QA validation."
              />
            )}
          </div>
        </div>
      ) : null}

      {isAdmin && users.length > 0 ? (
        <div className="glass-card rounded-2xl border border-border/50 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Management Users</h3>
            <Button asChild size="sm" variant="outline">
              <Link to="/users">View All</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.slice(0, 6).map((portalUser) => (
                <TableRow key={portalUser.id}>
                  <TableCell className="font-medium">{portalUser.name}</TableCell>
                  <TableCell>{getRoleDisplayLabel(portalUser.role)}</TableCell>
                  <TableCell>{portalUser.status}</TableCell>
                  <TableCell>{formatDate(portalUser.lastActive)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {isAdmin ? (
        summary?.recentActivity && summary.recentActivity.length > 0 ? (
          <div className="glass-card rounded-2xl border border-border/50 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <Button asChild size="sm" variant="outline">
                <Link to="/audit-log">View All Logs</Link>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.recentActivity.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.timestamp)}</TableCell>
                    <TableCell>{item.user}</TableCell>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{item.module}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={ScrollText}
            title="No recent activity"
            description="System events from users, inventory, and inspections will appear here."
          />
        )
      ) : null}
    </div>
  );
}
