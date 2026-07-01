import type { Inspection, SizeValidation } from '@/types';

/** Warehouse decision labels aligned with mobile + thesis business rules. */
export type WarehouseDecision =
  | 'Available for Sale'
  | 'Manual Review'
  | 'Inventory Block';

export function deriveWarehouseDecision(input: {
  confidence: number;
  sizeValidation: SizeValidation;
  inventoryStatus?: string;
  decision?: string;
}): WarehouseDecision {
  if (input.sizeValidation === 'Invalid' || input.inventoryStatus === 'Rejected') {
    return 'Inventory Block';
  }
  if (input.confidence >= 0.85 && input.sizeValidation === 'Valid') {
    return 'Available for Sale';
  }
  return 'Manual Review';
}

export function warehouseDecisionForInspection(inspection: Inspection): WarehouseDecision {
  return deriveWarehouseDecision({
    confidence: inspection.confidence,
    sizeValidation: inspection.sizeValidation,
    inventoryStatus: inspection.inventoryStatus,
    decision: inspection.decision,
  });
}

export function warehouseDecisionForRecognition(confidence: number): WarehouseDecision {
  return deriveWarehouseDecision({
    confidence,
    sizeValidation: 'Valid',
  });
}
