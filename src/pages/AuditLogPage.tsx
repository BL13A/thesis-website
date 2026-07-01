import { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
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
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';

export function AuditLogPage() {
  const { dashboardSummary, isLoading } = useAppData();
  const activity = dashboardSummary?.recentActivity ?? [];
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return activity;
    return activity.filter(
      (item) =>
        item.user.toLowerCase().includes(query) ||
        item.action.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query),
    );
  }, [activity, debouncedSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Administrative and warehouse activity across recognition monitoring, inventory, procurement, and supplier modules."
      />

      <Input
        placeholder="Search user, action, or module..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading && activity.length === 0 ? (
        <TableSkeleton rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No activity recorded"
          description="Activity entries appear when users review inspections, adjust inventory, or process procurement."
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.timestamp)}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>{item.action}</TableCell>
                  <TableCell>{item.module}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
