import { cn } from '@/lib/utils';
import type { AccessCell } from '@/config/rolePermissions';

const STYLES: Record<AccessCell, string> = {
  full: 'border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.12)] text-emerald-400',
  'view-only': 'border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.1)] text-[#facc15]',
  none: 'border-[rgba(100,116,139,0.25)] bg-[rgba(100,116,139,0.08)] text-[#64748b]',
};

const LABELS: Record<AccessCell, string> = {
  full: 'Full',
  'view-only': 'View Only',
  none: '—',
};

export function AccessCellBadge({ access }: { access: AccessCell }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[72px] items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STYLES[access],
      )}
    >
      {access === 'none' ? LABELS.none : LABELS[access]}
    </span>
  );
}
