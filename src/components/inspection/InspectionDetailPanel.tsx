import { ImageIcon } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { warehouseDecisionForInspection } from '@/lib/warehouseDecisions';
import { formatDate, formatPercent } from '@/lib/utils';
import type { Inspection } from '@/types';

function resolveImageUrl(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith('http') || uri.startsWith('data:')) return uri;
  const base = (import.meta.env.VITE_API_URL ?? 'http://192.168.8.124:3000').replace(/\/$/, '');
  if (uri.startsWith('/api/')) return `${base}${uri}`;
  return uri;
}

interface InspectionDetailPanelProps {
  inspection: Inspection;
  canQaApprove?: boolean;
  remarks?: string;
  submitting?: boolean;
  onRemarksChange?: (value: string) => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function InspectionDetailPanel({
  inspection,
  canQaApprove,
  remarks = '',
  submitting,
  onRemarksChange,
  onApprove,
  onReject,
}: InspectionDetailPanelProps) {
  const warehouseDecision = warehouseDecisionForInspection(inspection);
  const originalImage = resolveImageUrl(inspection.imageUrl);
  const annotatedImage = resolveImageUrl(inspection.annotatedImageUrl ?? inspection.imageUrl);

  const rows: Array<[string, string]> = [
    ['Inspection ID', inspection.id],
    ['Batch ID', inspection.batchId],
    ['Tile SKU', inspection.tileSku ?? '—'],
    ['Tile Type', inspection.tileType],
    ['Material', inspection.material ?? '—'],
    ['Surface Finish', inspection.surfaceFinish ?? '—'],
    ['Size Category', inspection.tileSize ?? '—'],
    ['Confidence Score', formatPercent(inspection.confidence)],
    ['Width (mm)', inspection.widthMm != null ? String(inspection.widthMm) : '—'],
    ['Height (mm)', inspection.heightMm != null ? String(inspection.heightMm) : '—'],
    ['Dimension Status', inspection.sizeValidation === 'Valid' ? 'Valid' : 'Invalid'],
    ['Warehouse Decision', warehouseDecision],
    ['Supplier', inspection.supplier],
    ['Defect Type', inspection.defectType],
    ['Inspector', inspection.inspectedByName ?? '—'],
    ['Timestamp', formatDate(inspection.date)],
    ['QA Status', inspection.qaStatus],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Original Tile Image
          </p>
          {originalImage ? (
            <img
              src={originalImage}
              alt="Original tile capture"
              className="max-h-56 w-full rounded-lg border object-contain bg-muted/20"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
              <ImageIcon className="mr-2 h-5 w-5" />
              No original image stored
            </div>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            YOLOv8 Annotated Image
          </p>
          {annotatedImage ? (
            <img
              src={annotatedImage}
              alt="YOLO annotated capture"
              className="max-h-56 w-full rounded-lg border object-contain bg-muted/20"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-muted-foreground">
              <ImageIcon className="mr-2 h-5 w-5" />
              Annotated image not available
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border/50 py-2">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 py-2">
          <span className="text-muted-foreground">Decision Badge</span>
          <StatusBadge status={warehouseDecision} />
        </div>
      </div>

      {canQaApprove && inspection.qaStatus === 'Pending' ? (
        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4">
          <p className="text-sm font-semibold">QA Review Actions</p>
          <p className="text-xs text-muted-foreground">
            Validate YOLOv8 classification and OpenCV dimensional results from the mobile warehouse app.
          </p>
          <div>
            <Label htmlFor="qa-remarks">QA Remarks</Label>
            <textarea
              id="qa-remarks"
              value={remarks}
              onChange={(e) => onRemarksChange?.(e.target.value)}
              className="mt-1.5 min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button disabled={submitting} onClick={onApprove}>
              Approve Inspection
            </Button>
            <Button variant="destructive" disabled={submitting} onClick={onReject}>
              Reject Inspection
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
