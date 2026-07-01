import { useMemo, useState } from 'react';
import { ImageIcon, ScanSearch } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useAppData } from '@/hooks/useAppData';
import { warehouseDecisionForRecognition } from '@/lib/warehouseDecisions';
import { fetchRecognitionLogs } from '@/services/recognitionService';
import type { RecognitionLog } from '@/types';
import { formatDate } from '@/lib/utils';

function resolveImageUrl(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith('http') || uri.startsWith('data:')) return uri;
  const base = (import.meta.env.VITE_API_URL ?? 'http://192.168.8.124:3000').replace(/\/$/, '');
  if (uri.startsWith('/api/')) return `${base}${uri}`;
  return uri;
}

export function AIRecognitionPage() {
  const { dashboardSummary } = useAppData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<RecognitionLog | null>(null);
  const [extraLogs, setExtraLogs] = useState<RecognitionLog[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const logs = useMemo(() => {
    const base = dashboardSummary?.recentRecognitionLogs ?? [];
    const merged = [...base, ...extraLogs];
    const seen = new Set<string>();
    return merged.filter((log) => {
      if (seen.has(log.id)) return false;
      seen.add(log.id);
      return true;
    });
  }, [dashboardSummary?.recentRecognitionLogs, extraLogs]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return logs;
    return logs.filter(
      (log) =>
        log.recognizedName.toLowerCase().includes(query) ||
        log.tileType.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query),
    );
  }, [logs, search]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const rows = await fetchRecognitionLogs(100);
      setExtraLogs(rows);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tile Recognition Monitoring"
        description="Monitor YOLOv8 recognition results submitted from the mobile warehouse application."
      />

      <Card className="glass-card border-border/50">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search SKU, tile type, or warehouse user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
              {loadingMore ? 'Refreshing...' : 'Refresh Logs'}
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={ScanSearch}
              title="No recognition results"
              description="Results appear here when Warehouse Personnel scan tiles on the mobile app."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspection ID</TableHead>
                    <TableHead>Tile SKU / Name</TableHead>
                    <TableHead>Tile Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Captured By</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(log)}
                    >
                      <TableCell className="font-mono text-xs">{log.id}</TableCell>
                      <TableCell className="font-medium">{log.recognizedName}</TableCell>
                      <TableCell>{log.tileType}</TableCell>
                      <TableCell>{Math.round(log.confidenceScore * 100)}%</TableCell>
                      <TableCell>
                        <StatusBadge status={warehouseDecisionForRecognition(log.confidenceScore)} />
                      </TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Recognition Detail</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Inspection ID</p>
                  <p className="font-medium">{selected.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Decision</p>
                  <StatusBadge status={warehouseDecisionForRecognition(selected.confidenceScore)} />
                </div>
                <div>
                  <p className="text-muted-foreground">Tile Type</p>
                  <p>{selected.tileType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Confidence</p>
                  <p>{Math.round(selected.confidenceScore * 100)}%</p>
                </div>
              </div>

              {resolveImageUrl(selected.imageUri) ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    YOLOv8 Annotated Image
                  </p>
                  <img
                    src={resolveImageUrl(selected.imageUri)}
                    alt="Recognition capture"
                    className="w-full rounded-lg border object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/20 text-muted-foreground">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Image not available for this record
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
