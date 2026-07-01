import { useState } from 'react';
import { AlertTriangle, Plus, ShoppingCart } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ModuleUnavailable } from '@/components/ModuleUnavailable';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppData } from '@/hooks/useAppData';
import { usePermission } from '@/hooks/usePermission';
import { createPurchaseRequest, updatePurchaseRequestStatus } from '@/services/procurementService';
import type { ProcurementStatus } from '@/types';
import { formatDate } from '@/lib/utils';

const PR_STATUSES: ProcurementStatus[] = ['Pending', 'Approved', 'Ordered', 'Received', 'Cancelled'];

export function ProcurementPage() {
  const { procurementRequests, procurementAlerts, procurementAvailable, refresh } = useAppData();
  const { isViewOnly } = usePermission();
  const viewOnly = isViewOnly('procurement');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ tileName: '', quantity: '1', supplierName: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      await createPurchaseRequest({
        tileName: form.tileName,
        quantity: Number(form.quantity),
        supplierName: form.supplierName,
        notes: form.notes,
      });
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase request.');
    } finally {
      setSaving(false);
    }
  };

  const createFromAlert = (alert: (typeof procurementAlerts)[0]) => {
    setForm({
      tileName: alert.tileName,
      quantity: String(Math.max(alert.reorderPoint - alert.currentStock, 1)),
      supplierName: alert.supplier,
      notes: 'Auto-suggested from low stock alert',
    });
    setDialogOpen(true);
  };

  const handleStatus = async (id: string, status: ProcurementStatus) => {
    try {
      await updatePurchaseRequestStatus(id, status);
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Status update failed.');
    }
  };

  if (!procurementAvailable) {
    return (
      <div>
        <PageHeader title="Procurement" description="Purchase requests and reorder management." />
        <ModuleUnavailable
          icon={ShoppingCart}
          title="Procurement API unavailable"
          description="Connect to the TileVision API with procurement permissions."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Procurement"
        description="Create purchase requests, track approval workflow, and respond to low stock alerts."
        viewOnly={viewOnly}
        actions={
          !viewOnly ? (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Purchase Request
            </Button>
          ) : null
        }
      />

      {procurementAlerts.length > 0 ? (
        <div className="glass-card rounded-2xl border border-amber-500/30 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            Low Stock — Suggested Procurement
          </h3>
          <div className="space-y-2">
            {procurementAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 p-3">
                <div>
                  <p className="font-medium">{alert.tileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {alert.currentStock} / {alert.reorderPoint} · {alert.supplier || 'No supplier'}
                  </p>
                </div>
                {!viewOnly ? (
                  <Button size="sm" variant="outline" onClick={() => createFromAlert(alert)}>
                    Create PR
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {procurementRequests.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No purchase requests" description="Create a purchase request to get started." />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR #</TableHead>
                <TableHead>Tile</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementRequests.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell>{pr.prNumber}</TableCell>
                  <TableCell>{pr.tileName}</TableCell>
                  <TableCell>{pr.quantity}</TableCell>
                  <TableCell>{pr.supplier}</TableCell>
                  <TableCell>
                    <StatusBadge status={pr.status} />
                  </TableCell>
                  <TableCell>{formatDate(pr.date)}</TableCell>
                  <TableCell className="text-right">
                    {!viewOnly ? (
                      <select
                        value={pr.status}
                        onChange={(e) => void handleStatus(pr.id, e.target.value as ProcurementStatus)}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {PR_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {[
              ['tileName', 'Tile Name'],
              ['quantity', 'Quantity'],
              ['supplierName', 'Supplier'],
              ['notes', 'Notes'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  type={key === 'quantity' ? 'number' : 'text'}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                />
              </div>
            ))}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => void handleCreate()} disabled={saving}>
              {saving ? 'Saving...' : 'Submit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
