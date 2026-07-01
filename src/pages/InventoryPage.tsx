import { useMemo, useState } from 'react';
import { Download, History, Package, Pencil, Plus, Trash2 } from 'lucide-react';
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
import {
  createTile,
  deleteTile,
  fetchTileHistory,
  recordStockMovement,
  updateTile,
} from '@/services/inventoryService';
import type { InventoryItem, StockMovement } from '@/types';
import { INVENTORY_TILE_TYPES } from '@/constants/inventory';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = {
  tileName: '',
  category: '',
  size: '',
  color: '',
  finish: '',
  material: '',
  supplier: '',
  warehouseLocation: '',
  availableStock: '0',
  reorderPoint: '10',
  sku: '',
  imageUri: '',
  status: 'Active',
};

export function InventoryPage() {
  const { inventory, inventoryAvailable, refresh } = useAppData();
  const { can, isViewOnly } = usePermission();
  const viewOnly = isViewOnly('inventory');
  const canExport = can('inventory:export');

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [selected, setSelected] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stockForm, setStockForm] = useState({ type: 'In' as 'In' | 'Out', quantity: '1', reason: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        !search ||
        item.tileName.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchesType = !typeFilter || item.category === typeFilter;
      const matchesStock = !stockFilter || item.stockStatus === stockFilter;
      return matchesSearch && matchesType && matchesStock;
    });
  }, [inventory, search, typeFilter, stockFilter]);

  const tileTypes = useMemo(
    () =>
      Array.from(
        new Set([
          ...INVENTORY_TILE_TYPES,
          ...inventory.map((item) => item.category).filter(Boolean),
        ]),
      ),
    [inventory],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditing(item);
    setForm({
      tileName: item.tileName,
      category: item.category,
      size: item.size,
      color: item.color,
      finish: item.finish,
      material: item.material,
      supplier: item.supplier,
      warehouseLocation: item.warehouseLocation,
      availableStock: String(item.availableStock),
      reorderPoint: String(item.reorderPoint),
      sku: item.sku === '—' ? '' : item.sku,
      imageUri: item.imageUri ?? '',
      status: item.status,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.tileName,
        tileType: form.category,
        size: form.size,
        color: form.color,
        finish: form.finish,
        material: form.material,
        supplierName: form.supplier,
        warehouseLocation: form.warehouseLocation,
        stockQuantity: Number(form.availableStock),
        lowStockThreshold: Number(form.reorderPoint),
        sku: form.sku || undefined,
        imageUri: form.imageUri || undefined,
        status: form.status,
      };
      if (editing) {
        await updateTile(editing.id, payload);
      } else {
        await createTile(payload);
      }
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Delete ${item.tileName}?`)) return;
    try {
      await deleteTile(item.id);
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Cannot delete tile.');
    }
  };

  const openStock = (item: InventoryItem, type: 'In' | 'Out') => {
    setSelected(item);
    setStockForm({ type, quantity: '1', reason: type === 'In' ? 'Stock replenishment' : 'Stock issue' });
    setError(null);
    setStockDialogOpen(true);
  };

  const handleStock = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await recordStockMovement({
        tileId: selected.id,
        transactionType: stockForm.type,
        quantity: Number(stockForm.quantity),
        reason: stockForm.reason,
        transactionDate: new Date().toISOString(),
      });
      setStockDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Stock movement failed.');
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (item: InventoryItem) => {
    setSelected(item);
    setHistory([]);
    setHistoryDialogOpen(true);
    try {
      const rows = await fetchTileHistory(item.id);
      setHistory(rows);
    } catch {
      setHistory([]);
    }
  };

  if (!inventoryAvailable) {
    return (
      <div>
        <PageHeader title="Inventory Management" description="Tile catalog, stock levels, and warehouse locations." />
        <ModuleUnavailable
          icon={Package}
          title="Inventory API unavailable"
          description="Start the TileVision API and sign in with a role that has inventory permissions."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Manage tile products, stock in/out, reorder levels, and warehouse locations."
        viewOnly={viewOnly}
        actions={
          <div className="flex gap-2">
            {canExport ? (
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv(
                    `tilevision-inventory-${new Date().toISOString().slice(0, 10)}.csv`,
                    filtered.map((item) => ({
                      sku: item.sku,
                      tileName: item.tileName,
                      tileType: item.category,
                      material: item.material,
                      surfaceFinish: item.finish,
                      colorCategory: item.color,
                      sizeCategory: item.size,
                      availableQuantity: item.availableStock,
                      blockedQuantity: item.blockedStock,
                      reorderPoint: item.reorderPoint,
                      status: item.stockStatus ?? item.status,
                    })),
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            ) : null}
            {!viewOnly ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tile
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search tiles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All types</option>
          {tileTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All stock status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No tiles found"
          description="Add your first tile product or adjust search filters."
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tile</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.tileName}</div>
                    <div className="text-xs text-muted-foreground">{item.sku}</div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.availableStock}</TableCell>
                  <TableCell>{item.warehouseLocation || '—'}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.stockStatus ?? 'In Stock'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => void openHistory(item)}>
                        <History className="h-4 w-4" />
                      </Button>
                      {!viewOnly ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => openStock(item, 'In')}>
                            In
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openStock(item, 'Out')}>
                            Out
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => void handleDelete(item)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tile' : 'Add Tile'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {[
              ['tileName', 'Tile Name'],
              ['category', 'Tile Type'],
              ['size', 'Size'],
              ['color', 'Color'],
              ['finish', 'Finish'],
              ['material', 'Material'],
              ['supplier', 'Supplier'],
              ['warehouseLocation', 'Warehouse Location'],
              ['availableStock', 'Quantity'],
              ['reorderPoint', 'Reorder Level'],
              ['sku', 'SKU'],
              ['imageUri', 'Image URL'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))}
                />
              </div>
            ))}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock {stockForm.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{selected?.tileName}</p>
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={stockForm.quantity}
                onChange={(e) => setStockForm((c) => ({ ...c, quantity: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input
                value={stockForm.reason}
                onChange={(e) => setStockForm((c) => ({ ...c, reason: e.target.value }))}
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => void handleStock()} disabled={saving}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory History — {selected?.tileName}</DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stock movements recorded.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.transactionType}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>{formatDate(row.transactionDate)}</TableCell>
                    <TableCell>{row.handledByName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
