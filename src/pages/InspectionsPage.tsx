import { useMemo, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { InspectionDetailPanel } from '@/components/inspection/InspectionDetailPanel';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { warehouseDecisionForInspection } from '@/lib/warehouseDecisions';
import { useInspections } from '@/hooks/useInspections';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermission } from '@/hooks/usePermission';
import { formatDate, formatPercent } from '@/lib/utils';
import type { Inspection } from '@/types';

interface InspectionsPageProps {
  defaultDecisionFilter?: string;
  title?: string;
  description?: string;
  /** When true, only show inspections awaiting QA action. */
  reviewQueueOnly?: boolean;
}

export function InspectionsPage({
  defaultDecisionFilter = 'all',
  title = 'Inspection Records',
  description = 'Monitor AI-assisted tile recognition and OpenCV dimensional validation submitted from the mobile warehouse application.',
  reviewQueueOnly = false,
}: InspectionsPageProps = {}) {
  const { user } = useAuth();
  const { inspections, isLoading, error, reload, reviewInspection } = useInspections();
  const { can, isViewOnly } = usePermission();
  const viewOnly = isViewOnly('inspections');
  const canQaApprove = can('inspections:qa-approve');

  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState(defaultDecisionFilter);
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    return inspections.filter((insp) => {
      const decision = warehouseDecisionForInspection(insp);
      const matchesSearch =
        debouncedSearch === '' ||
        insp.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        insp.batchId.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        insp.supplier.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        insp.tileType.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesDecision = decisionFilter === 'all' || decision === decisionFilter;
      const matchesQueue = !reviewQueueOnly || insp.qaStatus === 'Pending';
      return matchesSearch && matchesDecision && matchesQueue;
    });
  }, [inspections, debouncedSearch, decisionFilter, reviewQueueOnly]);

  const openDetail = (insp: Inspection) => {
    setSelected(insp);
    setRemarks(insp.qaRemarks ?? '');
  };

  const handleReview = async (qaStatus: 'Passed' | 'Rejected') => {
    if (!selected || !user || !remarks.trim()) return;
    setSubmitting(true);
    try {
      await reviewInspection(selected.id, qaStatus, remarks.trim(), user.name);
      setSelected(null);
      await reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        viewOnly={viewOnly}
        actions={
          <Button variant="outline" onClick={() => void reload()}>
            Refresh
          </Button>
        }
      />

      {error ? (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inspection ID, batch, supplier, or tile type..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={decisionFilter} onValueChange={setDecisionFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Warehouse Decision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            <SelectItem value="Available for Sale">Available for Sale</SelectItem>
            <SelectItem value="Manual Review">Manual Review</SelectItem>
            <SelectItem value="Inventory Block">Inventory Block</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && inspections.length === 0 ? (
        <TableSkeleton rows={8} cols={10} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={
            error
              ? 'Unable to load inspection records'
              : reviewQueueOnly
                ? 'No pending manual reviews'
                : 'No inspection records found'
          }
          description={
            error ??
            (reviewQueueOnly
              ? 'Cases appear here when AI confidence is below 85% or warehouse flags a batch for QA verification.'
              : 'Records appear here after warehouse personnel submit inspections from the TileVision mobile application.')
          }
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inspection ID</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Tile Type</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Size Category</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Dimension Status</TableHead>
                  <TableHead>Decision</TableHead>
                  <TableHead>QA Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((insp) => {
                  const decision = warehouseDecisionForInspection(insp);
                  return (
                    <TableRow key={insp.id} className="cursor-pointer" onClick={() => openDetail(insp)}>
                      <TableCell className="font-mono text-xs">{insp.id}</TableCell>
                      <TableCell className="font-medium text-primary">{insp.batchId}</TableCell>
                      <TableCell>{insp.tileType}</TableCell>
                      <TableCell>{insp.material ?? '—'}</TableCell>
                      <TableCell>{insp.tileSize ?? '—'}</TableCell>
                      <TableCell>{formatPercent(insp.confidence)}</TableCell>
                      <TableCell>
                        <StatusBadge status={insp.sizeValidation === 'Valid' ? 'Valid' : 'Invalid'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={decision} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={insp.qaStatus} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(insp.date)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Inspection Monitoring Detail</SheetTitle>
                <p className="text-sm text-muted-foreground">{selected.batchId}</p>
              </SheetHeader>
              <div className="mt-6">
                <InspectionDetailPanel
                  inspection={selected}
                  canQaApprove={canQaApprove}
                  remarks={remarks}
                  submitting={submitting}
                  onRemarksChange={setRemarks}
                  onApprove={() => void handleReview('Passed')}
                  onReject={() => void handleReview('Rejected')}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
