import { apiRequest, getSuppliersApiUrl } from '@/services/apiClient';
import type { Supplier, SupplierStatus } from '@/types';

interface ApiSupplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  leadTimeDays: number;
  status: string;
}

function mapSupplier(record: ApiSupplier): Supplier {
  return {
    id: record.id,
    name: record.name,
    contactPerson: record.contactPerson,
    email: record.email,
    phone: record.phone,
    address: record.address,
    leadTime: record.leadTimeDays,
    defectRate: 0,
    performanceScore: 100,
    status: (record.status === 'Active' ? 'Active' : 'Inactive') as SupplierStatus,
    deliveryHistory: [],
    defectHistory: [],
  };
}

export async function fetchSuppliers(): Promise<{ suppliers: Supplier[]; available: boolean }> {
  const result = await apiRequest<{ success: boolean; suppliers: ApiSupplier[] }>(
    getSuppliersApiUrl(''),
    { auth: true },
  );
  return { suppliers: result.suppliers.map(mapSupplier), available: true };
}

export async function createSupplier(payload: {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays?: number;
  status?: string;
}): Promise<Supplier> {
  const result = await apiRequest<{ success: boolean; supplier: ApiSupplier }>(
    getSuppliersApiUrl(''),
    { method: 'POST', body: payload, auth: true },
  );
  return mapSupplier(result.supplier);
}

export async function updateSupplier(
  supplierId: string,
  payload: Partial<{
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    leadTimeDays: number;
    status: string;
  }>,
): Promise<Supplier> {
  const result = await apiRequest<{ success: boolean; supplier: ApiSupplier }>(
    getSuppliersApiUrl(`/${supplierId}`),
    { method: 'PUT', body: payload, auth: true },
  );
  return mapSupplier(result.supplier);
}
