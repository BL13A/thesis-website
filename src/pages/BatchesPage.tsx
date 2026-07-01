import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppData } from '@/hooks/useAppData';
import { formatDate } from '@/lib/utils';

interface BatchRow {
  batchId: string;
  supplier: string;
  deliveryDate: string;
  quantityReceived: string;
  inspectionStatus: string;
  createdBy: string;
  recordCount: number;
}

export function BatchesPage() {
  const { inspections, isLoading, error } = useAppData();
  const [search, setSearch] = useState('');

  const batches = useMemo(() => {
    const map = new Map<string, BatchRow>();
    for (const insp of inspections) {
      const existing = map.get(insp.batchId);
      if (!existing) {
        map.set(insp.batchId, {
          batchId: insp.batchId,
          supplier: insp.supplier,
          deliveryDate: insp.date,
          quantityReceived: insp.quantity ?? '—',
          inspectionStatus: insp.qaStatus !== 'None' ? insp.qaStatus : insp.decision,
          createdBy: insp.inspectedByName ?? '—',
          recordCount: 1,
        });
        continue;
      }
      existing.recordCount += 1;
      if (new Date(insp.date).getTime() > new Date(existing.deliveryDate).getTime()) {
        existing.deliveryDate = insp.date;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate));
  }, [inspections]);

  const filtered = batches.filter((batch) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      batch.batchId.toLowerCase().includes(query) ||
      batch.supplier.toLowerCase().includes(query) ||
      batch.createdBy.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Monitoring"
        description="Monitor inbound tile batches, delivery dates, and inspection status."
      />

      {error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <Input
        placeholder="Search batch ID, supplier, or creator..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No batch records"
          description="Batch rows are derived from inspection submissions in the warehouse system."
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Quantity Received</TableHead>
                <TableHead>Inspection Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((batch) => (
                <TableRow key={batch.batchId}>
                  <TableCell className="font-medium">{batch.batchId}</TableCell>
                  <TableCell>{batch.supplier}</TableCell>
                  <TableCell>{formatDate(batch.deliveryDate)}</TableCell>
                  <TableCell>{batch.quantityReceived}</TableCell>
                  <TableCell>
                    <StatusBadge status={batch.inspectionStatus} />
                  </TableCell>
                  <TableCell>{batch.createdBy}</TableCell>
                  <TableCell>{batch.recordCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
