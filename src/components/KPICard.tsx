import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { KPIData } from '@/types';

interface KPICardProps extends KPIData {
  icon: LucideIcon;
  gradient: string;
  index?: number;
}

export function KPICard({
  label,
  value,
  change,
  trend,
  displayValue,
  icon: Icon,
  gradient,
  index = 0,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card gradient-border rounded-xl p-5 cursor-default group"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br shadow-lg', gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend === 'up' && 'text-emerald-400 bg-emerald-500/10',
            trend === 'down' && 'text-emerald-400 bg-emerald-500/10',
            trend === 'neutral' && 'text-muted-foreground bg-muted/50',
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {change !== 0 ? `${Math.abs(change)}%` : '—'}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">
          {displayValue ?? formatNumber(value)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}
