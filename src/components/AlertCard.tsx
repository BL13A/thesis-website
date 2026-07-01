import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatNumber } from '@/lib/utils';
import type { ProcurementAlert } from '@/types';

export function AlertCard({ alert, index }: { alert: ProcurementAlert; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-sm">{alert.tileName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.supplier}</p>
          </div>
        </div>
        <StatusBadge status={alert.urgency} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-background/40 px-2.5 py-1.5">
          <span className="text-muted-foreground">Stock: </span>
          <span className="font-medium">{formatNumber(alert.currentStock)}</span>
        </div>
        <div className="rounded-md bg-background/40 px-2.5 py-1.5">
          <span className="text-muted-foreground">Reorder: </span>
          <span className="font-medium">{formatNumber(alert.reorderPoint)}</span>
        </div>
      </div>
    </motion.div>
  );
}
