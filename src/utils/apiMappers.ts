import { warehouseDecisionForInspection } from '@/lib/warehouseDecisions';
import type { InventoryItem, TileProduct } from '@/types';
import type { Inspection, QAStatus, SessionUser, User, UserStatus } from '@/types';
import { getAccountPlatform, normalizeAccountRole, normalizeWebRole } from '@/utils/roles';

export interface ApiInspectionRecord {
  id: string;
  date: string;
  batchId: string;
  supplierName: string;
  tileType: string;
  tileSize?: string;
  quantity?: string;
  expectedDimension?: string;
  imageUri?: string;
  result: 'Passed' | 'Rejected' | 'Manual';
  defectType: string;
  confidenceScore: number;
  sizeValidation: 'Valid' | 'Invalid';
  inventoryStatus: 'Available' | 'Rejected' | 'Pending';
  inspectedBy: string;
  inspectedByName?: string;
  qaStatus: QAStatus;
  qaRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  mobileNumber?: string;
  department?: string;
  accountStatus: string;
  lastLogin?: string;
}

function mapAccountStatus(accountStatus: string): UserStatus {
  if (accountStatus === 'Active') return 'Active';
  if (accountStatus === 'Suspended') return 'Suspended';
  return 'Inactive';
}

export function mapApiAccountUser(user: ApiUser): User {
  const role = normalizeAccountRole(user.role.trim());

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId,
    mobileNumber: user.mobileNumber,
    role,
    status: mapAccountStatus(user.accountStatus),
    lastActive: user.lastLogin ?? new Date().toISOString(),
    department: user.department ?? '—',
    platform: getAccountPlatform(role),
  };
}

/** Maps API user for web login — mobile-only accounts are rejected. */
export function mapApiUser(user: ApiUser): SessionUser | null {
  const role = normalizeWebRole(user.role);
  if (!role) {
    return null;
  }

  const account = mapApiAccountUser(user);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    employeeId: account.employeeId,
    mobileNumber: account.mobileNumber,
    role,
    status: account.status,
    lastActive: account.lastActive,
    department: account.department,
    platform: 'web',
  };
}

export function mapApiTile(tile: TileProduct): InventoryItem {
  return {
    id: tile.id,
    sku: tile.sku ?? '—',
    tileName: tile.name,
    category: tile.tileType,
    size: tile.size,
    color: tile.color,
    finish: tile.finish,
    material: tile.material,
    supplier: tile.supplierName ?? '',
    warehouseLocation: tile.warehouseLocation ?? '',
    availableStock: tile.stockQuantity,
    blockedStock: 0,
    reorderPoint: tile.lowStockThreshold,
    status: tile.status,
    stockStatus: tile.stockStatus,
    imageUri: tile.imageUri,
  };
}

function inferMaterial(tileType: string): string {
  if (tileType.includes('Porcelain')) return 'Porcelain';
  return 'Ceramic';
}

function inferSurfaceFinish(tileType: string): string {
  if (tileType.includes('Glazed Polished')) return 'Glazed Polished';
  if (tileType.includes('Porcelain')) return 'Polished';
  if (tileType.includes('Decor')) return 'Decorative';
  return 'Glazed';
}

function parseDimensionMm(text?: string): { width?: number; height?: number } {
  if (!text) return {};
  const numbers = text.match(/[\d.]+/g);
  if (!numbers?.length) return {};
  if (numbers.length === 1) {
    const value = Number(numbers[0]);
    return { width: value, height: value };
  }
  return { width: Number(numbers[0]), height: Number(numbers[1]) };
}

export function mapApiInspection(record: ApiInspectionRecord): Inspection {
  const dimensions = parseDimensionMm(record.expectedDimension ?? record.tileSize);
  const mapped: Inspection = {
    id: record.id,
    batchId: record.batchId,
    tileSku: record.batchId,
    tileType: record.tileType,
    tileCategory: record.tileType,
    tileSize: record.tileSize ?? record.expectedDimension ?? '—',
    material: inferMaterial(record.tileType),
    surfaceFinish: inferSurfaceFinish(record.tileType),
    quantity: record.quantity ?? '—',
    supplier: record.supplierName,
    defectType: record.defectType,
    confidence: record.confidenceScore,
    widthMm: dimensions.width,
    heightMm: dimensions.height,
    sizeValidation: record.sizeValidation,
    decision: record.result,
    finalDecision: record.qaStatus === 'Passed' || record.qaStatus === 'Rejected' ? record.qaStatus : record.result,
    inventoryStatus: record.inventoryStatus,
    inventoryRecommendation: record.inventoryStatus,
    qaStatus: record.qaStatus,
    date: record.date,
    qaRemarks: record.qaRemarks,
    reviewedBy: record.reviewedBy,
    reviewedAt: record.reviewedAt,
    imageUrl: record.imageUri,
    annotatedImageUrl: record.imageUri,
    inspectedByName: record.inspectedByName,
  };
  mapped.warehouseDecision = warehouseDecisionForInspection(mapped);
  return mapped;
}
