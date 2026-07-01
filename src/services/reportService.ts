import { apiRequest, getReportsApiUrl } from '@/services/apiClient';
import { downloadCsv } from '@/utils/exportCsv';
import type { Report, UserRole } from '@/types';
import { ROLE_REPORT_IDS } from '@/config/rolePermissions';

const REPORT_CATALOG: Report[] = [
  {
    id: 'recognition-logs',
    title: 'Tile Inspection Report',
    description: 'YOLOv8 recognition and warehouse inspection activity from mobile scans.',
    icon: 'scan',
    category: 'Quality Assurance',
  },
  {
    id: 'inventory',
    title: 'Inventory Status Report',
    description: 'Complete tile inventory with stock levels and warehouse locations.',
    icon: 'package',
    category: 'Inventory',
  },
  {
    id: 'low-stock',
    title: 'Reorder Monitoring Report',
    description: 'Tiles at or below reorder point with suggested replenishment focus.',
    icon: 'alert',
    category: 'Inventory',
  },
  {
    id: 'stock-movement',
    title: 'Warehouse Activity Report',
    description: 'Stock in and stock out transactions across warehouse operations.',
    icon: 'refresh',
    category: 'Warehouse',
  },
  {
    id: 'procurement',
    title: 'Procurement Report',
    description: 'Purchase requisition history, approvals, and procurement workflow status.',
    icon: 'file',
    category: 'Procurement',
  },
  {
    id: 'suppliers',
    title: 'Supplier Performance Report',
    description: 'Supplier lead time, delivery performance, and defect rate analytics.',
    icon: 'building',
    category: 'Suppliers',
  },
  {
    id: 'inspections',
    title: 'Defect Analysis Report',
    description: 'Inspection decisions, manual review cases, and inventory block trends.',
    icon: 'shield',
    category: 'Quality Assurance',
  },
  {
    id: 'delivery',
    title: 'Delivery Schedule Report',
    description: 'Scheduled and completed outbound delivery records.',
    icon: 'truck',
    category: 'Logistics',
  },
];

export function getReportsForRole(role: UserRole): Report[] {
  const allowed = ROLE_REPORT_IDS[role] ?? [];
  if (allowed === 'all') return REPORT_CATALOG;
  return REPORT_CATALOG.filter((report) => allowed.includes(report.id));
}

export async function generateReport(reportId: string): Promise<{
  available: true;
  rows: Record<string, unknown>[];
  generatedAt: string;
}> {
  const result = await apiRequest<{
    success: boolean;
    rows: Record<string, unknown>[];
    generatedAt: string;
  }>(getReportsApiUrl(reportId), { auth: true });

  return {
    available: true,
    rows: result.rows,
    generatedAt: result.generatedAt,
  };
}

export function downloadReportCsv(reportId: string, rows: Record<string, unknown>[]): void {
  downloadCsv(`tilevision-${reportId}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}
