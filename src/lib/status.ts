import type { InspectionResult, InventoryStatus, QAStatus, SizeValidation } from '@/types';

const PASS_VALUES = new Set([
  'Passed',
  'PASS',
  'Pass',
  'Available',
  'Available for Sale',
  'Approved',
  'Completed',
]);

const REJECT_VALUES = new Set([
  'Rejected',
  'REJECT',
  'Reject',
  'Blocked',
  'Block',
  'Inventory Block',
  'Size Out of Specification',
]);

const PENDING_VALUES = new Set([
  'Pending',
  'Manual',
  'MANUAL',
  'MANUAL REVIEW',
  'Manual Review',
  'Pending Review',
  'Draft',
]);

export type StatusTone = 'passed' | 'rejected' | 'pending' | 'neutral';

export function getStatusTone(value: string): StatusTone {
  if (value === 'None') return 'neutral';
  if (PASS_VALUES.has(value) || value === 'Active' || value === 'Valid' || value === 'In Stock' || value === 'Delivered') return 'passed';
  if (
    REJECT_VALUES.has(value) ||
    value === 'Inactive' ||
    value === 'Suspended' ||
    value === 'Invalid' ||
    value === 'Out of Stock' ||
    value === 'Cancelled'
  ) {
    return 'rejected';
  }
  if (
    PENDING_VALUES.has(value) ||
    value === 'Warning' ||
    value === 'Under Review' ||
    value === 'Medium' ||
    value === 'High' ||
    value === 'Low' ||
    value === 'Low Stock' ||
    value === 'Pending' ||
    value === 'Scheduled' ||
    value === 'Out for Delivery'
  ) {
    return 'pending';
  }
  if (value === 'Critical') return 'rejected';
  return 'neutral';
}

export function normalizeInspectionResult(value: string): InspectionResult {
  if (PASS_VALUES.has(value)) return 'Passed';
  if (REJECT_VALUES.has(value)) return 'Rejected';
  if (PENDING_VALUES.has(value)) return 'Manual';
  return 'Manual';
}

export function normalizeInventoryStatus(value: string): InventoryStatus {
  if (PASS_VALUES.has(value)) return 'Available';
  if (REJECT_VALUES.has(value)) return 'Rejected';
  if (PENDING_VALUES.has(value)) return 'Pending';
  return 'Pending';
}

export function normalizeQAStatus(value: string): QAStatus {
  if (value === 'None') return 'None';
  if (PASS_VALUES.has(value)) return 'Passed';
  if (REJECT_VALUES.has(value)) return 'Rejected';
  if (PENDING_VALUES.has(value)) return 'Pending';
  return 'None';
}

const INVENTORY_DISPLAY_LABELS: Record<InventoryStatus, string> = {
  Available: 'Available for Sale',
  Rejected: 'Inventory Block',
  Pending: 'Pending',
};

export function getInventoryStatusLabel(status: InventoryStatus | string): string {
  if (status in INVENTORY_DISPLAY_LABELS) {
    return INVENTORY_DISPLAY_LABELS[status as InventoryStatus];
  }
  return status;
}

export function getSizeValidationLabel(status: SizeValidation | string): string {
  if (status === 'Invalid') return 'Size Out of Specification';
  return status;
}
