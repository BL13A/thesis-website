import type { AppNotification } from '@/services/notificationService';
import type { Inspection, UserRole } from '@/types';

export interface DashboardKpi {
  label: string;
  value: number | string;
  hint?: string;
}

export interface RoleDashboardData {
  kpis: DashboardKpi[];
  alerts: { id: string; title: string; description: string; type: 'review' | 'warning' | 'critical' | 'info' }[];
  recentInspections: Inspection[];
}

function isToday(dateString: string): boolean {
  return new Date(dateString).toDateString() === new Date().toDateString();
}

function defectRate(inspections: Inspection[]): number {
  if (inspections.length === 0) return 0;
  const defects = inspections.filter((item) => item.decision !== 'Passed').length;
  return Math.round((defects / inspections.length) * 100);
}

export function buildRoleDashboard(
  role: UserRole,
  inspections: Inspection[],
  notifications: AppNotification[],
): RoleDashboardData {
  const todayInspections = inspections.filter((item) => isToday(item.date));
  const pendingQa = inspections.filter((item) => item.qaStatus === 'Pending');
  const passed = inspections.filter((item) => item.decision === 'Passed');
  const rejected = inspections.filter((item) => item.decision === 'Rejected');
  const blocked = inspections.filter((item) => item.inventoryStatus === 'Rejected' || item.inventoryRecommendation === 'Rejected');
  const unreadNotifications = notifications.filter((item) => !item.read);

  const supplierNames = new Set(inspections.map((item) => item.supplier));

  if (role === 'Quality Assurance Manager') {
    return {
      kpis: [
        { label: "Today's Inspections", value: todayInspections.length },
        { label: 'Manual Reviews Pending', value: pendingQa.length },
        { label: 'Passed Inspections', value: passed.length },
        { label: 'Rejected Inspections', value: rejected.length },
        { label: 'Average Defect Rate', value: `${defectRate(inspections)}%` },
      ],
      alerts: pendingQa.slice(0, 5).map((item) => ({
        id: item.id,
        title: `Manual review: ${item.batchId}`,
        description: `${item.supplier} · ${item.defectType}`,
        type: 'review' as const,
      })),
      recentInspections: inspections.slice(0, 8),
    };
  }

  if (role === 'System Administrator') {
    return {
      kpis: [
        { label: 'Total Users', value: 0, hint: 'User API not available yet' },
        { label: 'Active Users', value: 0, hint: 'User API not available yet' },
        { label: 'Pending QA Reviews', value: pendingQa.length },
        { label: 'Reorder Alerts', value: 0, hint: 'Procurement API not available yet' },
        { label: 'System Notifications', value: unreadNotifications.length },
        { label: 'Active Suppliers', value: supplierNames.size },
      ],
      alerts: unreadNotifications.slice(0, 5).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.message,
        type: 'info' as const,
      })),
      recentInspections: inspections.slice(0, 8),
    };
  }

  if (role === 'Inventory Manager') {
    return {
      kpis: [
        { label: 'Total Inventory', value: 0, hint: 'Inventory API not available yet' },
        { label: 'Available Inventory', value: passed.length },
        { label: 'Blocked Inventory', value: blocked.length },
        { label: 'Low Stock SKUs', value: 0, hint: 'Inventory API not available yet' },
        { label: 'Aging Inventory', value: 0, hint: 'Inventory API not available yet' },
      ],
      alerts: blocked.slice(0, 5).map((item) => ({
        id: item.id,
        title: `Inventory block: ${item.batchId}`,
        description: `${item.tileType} · ${item.defectType}`,
        type: 'warning' as const,
      })),
      recentInspections: inspections.slice(0, 8),
    };
  }

  if (role === 'Purchasing Officer') {
    return {
      kpis: [
        { label: 'Reorder Alerts', value: 0, hint: 'Procurement API not available yet' },
        { label: 'Pending Purchase Requests', value: 0, hint: 'Procurement API not available yet' },
        { label: 'Suppliers Monitored', value: supplierNames.size },
        { label: 'Average Lead Time', value: '—', hint: 'Supplier API not available yet' },
        { label: 'Supplier Warnings', value: 0, hint: 'Supplier API not available yet' },
      ],
      alerts: [],
      recentInspections: inspections.slice(0, 8),
    };
  }

  return {
    kpis: [
      { label: 'Inspections', value: inspections.length },
      { label: 'Passed', value: passed.length },
      { label: 'Rejected', value: rejected.length },
      { label: 'Manual QA', value: pendingQa.length },
    ],
    alerts: [],
    recentInspections: inspections.slice(0, 8),
  };
}
