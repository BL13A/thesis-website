import { apiRequest, getDeliveriesApiUrl } from '@/services/apiClient';
import type { Delivery } from '@/types';

export async function fetchDeliveries(): Promise<Delivery[]> {
  const result = await apiRequest<{ success: boolean; deliveries: Delivery[] }>(
    getDeliveriesApiUrl(''),
    { auth: true },
  );
  return result.deliveries;
}

export async function createDelivery(payload: {
  customerName: string;
  contactNumber: string;
  address: string;
  deliveryDate: string;
  status?: string;
  items: { tileId: string; quantity: number }[];
}): Promise<Delivery> {
  const result = await apiRequest<{ success: boolean; delivery: Delivery }>(
    getDeliveriesApiUrl(''),
    { method: 'POST', body: payload, auth: true },
  );
  return result.delivery;
}

export async function updateDelivery(
  deliveryId: string,
  payload: Partial<{
    customerName: string;
    contactNumber: string;
    address: string;
    deliveryDate: string;
    status: string;
    items: { tileId: string; quantity: number }[];
  }>,
): Promise<Delivery> {
  const result = await apiRequest<{ success: boolean; delivery: Delivery }>(
    getDeliveriesApiUrl(`/${deliveryId}`),
    { method: 'PUT', body: payload, auth: true },
  );
  return result.delivery;
}
