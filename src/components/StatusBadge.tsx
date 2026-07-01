import { Badge } from '@/components/ui/badge';
import {
  getInventoryStatusLabel,
  getSizeValidationLabel,
  getStatusTone,
} from '@/lib/status';
import type {
  InspectionResult,
  InventoryStatus,
  ProcurementStatus,
  QAStatus,
  UrgencyLevel,
  UserStatus,
} from '@/types';

type StatusType =
  | InspectionResult
  | InventoryStatus
  | QAStatus
  | ProcurementStatus
  | UrgencyLevel
  | UserStatus
  | string;

function toneToVariant(
  tone: ReturnType<typeof getStatusTone>,
): 'success' | 'destructive' | 'warning' | 'secondary' | 'default' {
  switch (tone) {
    case 'passed':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    case 'neutral':
    default:
      return 'secondary';
  }
}

type StatusBadgeProps = {
  status: StatusType;
  /** Use thesis-aligned inventory labels (Available for Sale, Inventory Block). */
  inventory?: boolean;
  /** Use thesis-aligned size labels (Size Out of Specification). */
  sizeValidation?: boolean;
};

export function StatusBadge({ status, inventory, sizeValidation }: StatusBadgeProps) {
  const variant = toneToVariant(getStatusTone(status));
  const label = sizeValidation
    ? getSizeValidationLabel(status)
    : inventory
      ? getInventoryStatusLabel(status)
      : status;
  return <Badge variant={variant}>{label}</Badge>;
}
