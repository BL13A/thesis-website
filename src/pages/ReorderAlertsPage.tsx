import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppData } from '@/hooks/useAppData';

export function ReorderAlertsPage() {
  const { dashboardSummary, procurementAlerts, inventory, isLoading } = useAppData();

  const lowStock =
    dashboardSummary?.lowStockTiles ??
    inventory.filter((item) => item.availableStock <= item.reorderPoint);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reorder Alerts"
        description="Tiles at or below reorder point. Procurement drafts may be generated automatically."
      />

      <div className="glass-card rounded-2xl border border-border/50 p-6">
        <h3 className="mb-4 text-lg font-semibold">Warehouse Inventory Alerts</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        ) : lowStock.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No reorder alerts"
            description="All monitored SKUs are above reorder point."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / Tile</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((tile) => {
                const name = 'name' in tile ? tile.name : tile.tileName;
                const stock = 'stockQuantity' in tile ? tile.stockQuantity : tile.availableStock;
                const reorder =
                  'lowStockThreshold' in tile ? tile.lowStockThreshold : tile.reorderPoint;
                const status =
                  ('stockStatus' in tile && tile.stockStatus) ||
                  (stock <= 0 ? 'Out of Stock' : 'Low Stock');
                return (
                  <TableRow key={tile.id}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>{stock}</TableCell>
                    <TableCell>{reorder}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {procurementAlerts.length > 0 ? (
        <div className="glass-card rounded-2xl border border-border/50 p-6">
          <h3 className="mb-4 text-lg font-semibold">Procurement Alerts</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tile</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>{alert.tileName}</TableCell>
                  <TableCell>{alert.currentStock}</TableCell>
                  <TableCell>{alert.reorderPoint}</TableCell>
                  <TableCell>
                    <StatusBadge status={alert.urgency} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
