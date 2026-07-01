import { apiRequest, getDashboardApiUrl } from '@/services/apiClient';
import type { Delivery, RecognitionLog } from '@/types';

export interface DashboardActivityItem {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
}

export interface WebDashboardSummary {
  totalTiles: number;
  totalInventoryQuantity: number;
  lowStockCount: number;
  pendingDeliveries: number;
  pendingPurchaseRequests: number;
  pendingManualReviews?: number;
  inventoryBlocked?: number;
  supplierCount?: number;
  recentRecognitionLogs: RecognitionLog[];
  recentDeliveries: Delivery[];
  lowStockTiles: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    lowStockThreshold: number;
    stockStatus?: string;
  }>;
  recentActivity?: DashboardActivityItem[];
}

export async function fetchWebDashboard(): Promise<WebDashboardSummary> {
  const result = await apiRequest<{ success: boolean; summary: WebDashboardSummary }>(
    getDashboardApiUrl('/web'),
    { auth: true },
  );
  return result.summary;
}
