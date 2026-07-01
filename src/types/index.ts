/** Management portal roles — warehouse floor staff use the mobile app. */
export type UserRole =
  | 'System Administrator'
  | 'Quality Assurance Manager'
  | 'Inventory Manager'
  | 'Purchasing Officer';

/** All TileVision roles (web portal + mobile warehouse). */
export type AccountRole =
  | UserRole
  | 'Warehouse Personnel';

export type InspectionResult = 'Passed' | 'Rejected' | 'Manual';
export type InventoryStatus = 'Available' | 'Rejected' | 'Pending';
export type QAStatus = 'Pending' | 'Passed' | 'Rejected' | 'None';
export type SizeValidation = 'Valid' | 'Invalid';
export type ProcurementStatus =
  | 'Pending'
  | 'Approved'
  | 'Ordered'
  | 'Received'
  | 'Cancelled';
export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserStatus = 'Active' | 'Inactive' | 'Suspended';

export interface Inspection {
  id: string;
  batchId: string;
  tileSku?: string;
  tileType: string;
  tileCategory?: string;
  tileSize?: string;
  material?: string;
  surfaceFinish?: string;
  quantity?: string;
  supplier: string;
  defectType: string;
  confidence: number;
  widthMm?: number;
  heightMm?: number;
  sizeValidation: SizeValidation;
  warehouseDecision?: string;
  decision: InspectionResult;
  finalDecision?: InspectionResult | QAStatus;
  inventoryStatus: InventoryStatus;
  inventoryRecommendation?: InventoryStatus | string;
  qaStatus: QAStatus;
  date: string;
  qaRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  imageUrl?: string;
  annotatedImageUrl?: string;
  inspectedByName?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  tileName: string;
  category: string;
  size: string;
  color: string;
  finish: string;
  material: string;
  supplier: string;
  warehouseLocation: string;
  availableStock: number;
  blockedStock: number;
  reorderPoint: number;
  status: string;
  stockStatus?: string;
  imageUri?: string;
}

export interface TileProduct {
  id: string;
  name: string;
  tileType: string;
  size: string;
  color: string;
  finish: string;
  material: string;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus?: string;
  status: string;
  imageUri?: string;
  sku?: string;
  supplierName?: string;
  warehouseLocation?: string;
}

export interface StockMovement {
  id: string;
  tileId: string;
  transactionType: 'In' | 'Out';
  quantity: number;
  reason: string;
  transactionDate: string;
  handledByName: string;
  tileName?: string;
}

export interface DeliveryItem {
  id: string;
  tileId: string;
  quantity: number;
  tileName?: string;
  tileType?: string;
  size?: string;
}

export interface Delivery {
  id: string;
  customerName: string;
  contactNumber: string;
  address: string;
  deliveryDate: string;
  status: string;
  items: DeliveryItem[];
  createdAt?: string;
}

export interface RecognitionLog {
  id: string;
  recognizedName: string;
  tileType: string;
  confidenceScore: number;
  matchedTileId?: string;
  userName: string;
  createdAt: string;
  imageUri?: string;
}

export interface YoloDetectionBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  label: string;
}

export interface YoloDetectionResult {
  tile_name: string;
  tile_type: string;
  confidence: number;
  annotated_image: string;
  inventory_id: string;
  stock_quantity: number;
  warehouse_location: string;
  reorder_level: number;
  low_stock: boolean;
  boxes: YoloDetectionBox[];
  recommendations: TileProduct[];
}

export interface TileRecognitionResult {
  recognizedName: string;
  tileType: string;
  confidenceScore: number;
  matchedTile?: TileProduct | null;
  inventoryMatch?: boolean;
  currentStock?: number;
  warehouseLocation?: string;
  reorderLevel?: number;
  lowStock?: boolean;
  stockStatus?: string;
  annotatedImage?: string;
  boxes?: YoloDetectionBox[];
  recommendations?: TileProduct[];
  modelNeedsRetrain?: boolean;
}

export interface DetectedTileSummary {
  tileId: string;
  predictedType: string;
  confidence: number;
  color: string;
  pattern: string;
  surfaceFinish: string;
  sizeCategory: string;
  widthMm?: number;
  heightMm?: number;
  dimensionStatus: string;
  status: string;
  boundingBoxLabel?: string;
  skuId?: string;
}

export interface RecommendedTileMatch {
  skuId: string;
  tileId?: string;
  tileName: string;
  tileType: string;
  matchPercentage: number;
  imageUrl?: string;
  material?: string;
  surfaceFinish?: string;
  sizeCategory?: string;
}

export interface TopRecommendation {
  rank: number;
  skuId: string;
  tileName: string;
  matchPercentage: number;
  tileId?: string;
}

export interface TileInspectResponse {
  imageUrl?: string;
  annotatedImageUrl?: string;
  detectedTiles: DetectedTileSummary[];
  recommendedTiles: RecommendedTileMatch[];
  topRecommendations: TopRecommendation[];
  message: string;
}

export interface ProcurementAlert {
  id: string;
  tileName: string;
  currentStock: number;
  reorderPoint: number;
  supplier: string;
  urgency: UrgencyLevel;
}

export interface ProcurementRequest {
  id: string;
  prNumber: string;
  sku: string;
  title: string;
  tileName: string;
  tileId?: string;
  quantity: number;
  supplier: string;
  supplierId?: string;
  status: ProcurementStatus;
  requestedBy: string;
  date: string;
  estimatedCost: number;
  notes?: string;
}

export type SupplierStatus = 'Active' | 'Inactive';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  leadTime: number;
  defectRate: number;
  performanceScore: number;
  status: SupplierStatus;
  deliveryHistory: { date: string; onTime: boolean; quantity: number }[];
  defectHistory: { date: string; defectType: string; batchId: string }[];
}

export interface Report {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  mobileNumber?: string;
  role: AccountRole;
  status: UserStatus;
  lastActive: string;
  department: string;
  platform: 'web' | 'mobile';
}

/** Signed-in web management portal user. */
export type SessionUser = Omit<User, 'role' | 'platform'> & {
  role: UserRole;
  platform: 'web';
};

export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  type: 'review' | 'warning' | 'critical' | 'info';
  count?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
}

export interface KPIData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  displayValue?: string;
}

export interface QAReviewRecord {
  id: string;
  batchId: string;
  tileType: string;
  supplier: string;
  defectType: string;
  confidence: number;
  qaStatus: QAStatus;
}

export interface InventoryDashboardRecord {
  id: string;
  sku: string;
  tileName: string;
  category: string;
  size: string;
  availableStock: number;
  blockedStock: number;
  reorderPoint: number;
  status: InventoryStatus;
}

export type PRStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Completed';

export interface ProcurementRequestRecord {
  id: string;
  prNumber: string;
  sku: string;
  tileName: string;
  supplier: string;
  quantityRequested: number;
  status: PRStatus;
  dateCreated: string;
}

export type SupplierMonitorStatus = 'Active' | 'Warning' | 'Under Review';

export interface SupplierPerformanceRecord {
  id: string;
  name: string;
  leadTime: number;
  defectRate: number;
  performanceScore: number;
  status: SupplierMonitorStatus;
}

export type AuditLogStatus = 'Success' | 'Failed' | 'Warning';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  module: string;
  details: string;
  status: AuditLogStatus;
}

export interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}
