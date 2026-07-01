import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ViewOnlyBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        'border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.1)] text-[#facc15]',
        className,
      )}
    >
      <Eye className="h-3 w-3" strokeWidth={2.5} />
      View Only Access
    </span>
  );
}
