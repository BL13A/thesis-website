import { apiRequest, getProcurementApiUrl } from '@/services/apiClient';
import type { ProcurementAlert, ProcurementRequest, ProcurementStatus } from '@/types';

interface ApiProcurementRequest {
  id: string;
  prNumber: string;
  tileId?: string;
  tileName: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  status: ProcurementStatus;
  requestedBy: string;
  requestedByName: string;
  notes?: string;
  createdAt: string;
}

function mapRequest(record: ApiProcurementRequest): ProcurementRequest {
  return {
    id: record.id,
    prNumber: record.prNumber,
    sku: record.tileId ?? '—',
    title: record.tileName,
    tileName: record.tileName,
    tileId: record.tileId,
    quantity: record.quantity,
    supplier: record.supplierName ?? '—',
    supplierId: record.supplierId,
    status: record.status,
    requestedBy: record.requestedByName,
    date: record.createdAt,
    estimatedCost: 0,
    notes: record.notes,
  };
}

export async function fetchProcurement(): Promise<{
  requests: ProcurementRequest[];
  alerts: ProcurementAlert[];
  available: boolean;
}> {
  const [requestsResult, alertsResult] = await Promise.all([
    apiRequest<{ success: boolean; requests: ApiProcurementRequest[] }>(
      getProcurementApiUrl('/requests'),
      { auth: true },
    ),
    apiRequest<{
      success: boolean;
      suggestions: Array<{
        tileId: string;
        tileName: string;
        currentStock: number;
        reorderPoint: number;
        supplierName: string;
        urgency: ProcurementAlert['urgency'];
      }>;
    }>(getProcurementApiUrl('/low-stock-suggestions'), { auth: true }),
  ]);

  return {
    requests: requestsResult.requests.map(mapRequest),
    alerts: alertsResult.suggestions.map((item) => ({
      id: item.tileId,
      tileName: item.tileName,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      supplier: item.supplierName,
      urgency: item.urgency,
    })),
    available: true,
  };
}

export async function createPurchaseRequest(payload: {
  tileId?: string;
  tileName: string;
  quantity: number;
  supplierId?: string;
  supplierName?: string;
  notes?: string;
}): Promise<ProcurementRequest> {
  const result = await apiRequest<{ success: boolean; request: ApiProcurementRequest }>(
    getProcurementApiUrl('/requests'),
    { method: 'POST', body: payload, auth: true },
  );
  return mapRequest(result.request);
}

export async function updatePurchaseRequestStatus(
  prId: string,
  status: ProcurementStatus,
  notes?: string,
): Promise<ProcurementRequest> {
  const result = await apiRequest<{ success: boolean; request: ApiProcurementRequest }>(
    getProcurementApiUrl(`/requests/${prId}`),
    { method: 'PUT', body: { status, notes }, auth: true },
  );
  return mapRequest(result.request);
}
