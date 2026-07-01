import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Info, ShieldAlert, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardAlert } from '@/types';

const ALERT_STYLES: Record<
  DashboardAlert['type'],
  { icon: LucideIcon; bg: string; iconColor: string; border: string }
> = {
  review: {
    icon: ShieldAlert,
    bg: 'rgba(245, 158, 11, 0.1)',
    iconColor: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'rgba(250, 204, 21, 0.08)',
    iconColor: '#facc15',
    border: 'rgba(250, 204, 21, 0.2)',
  },
  critical: {
    icon: UserX,
    bg: 'rgba(239, 68, 68, 0.1)',
    iconColor: '#ef4444',
    border: 'rgba(239, 68, 68, 0.2)',
  },
  info: {
    icon: Info,
    bg: 'rgba(59, 130, 246, 0.1)',
    iconColor: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.2)',
  },
};

export function DashboardAlertItem({
  alert,
  index,
}: {
  alert: DashboardAlert;
  index: number;
}) {
  const style = ALERT_STYLES[alert.type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-colors hover:border-[rgba(59,130,246,0.25)]',
        'bg-[rgba(15,23,42,0.45)]',
      )}
      style={{ borderColor: style.border }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: style.bg }}
      >
        <Icon className="h-5 w-5" style={{ color: style.iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#f8fafc]">{alert.title}</p>
          {alert.count != null ? (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: style.bg, color: style.iconColor }}
            >
              {alert.count}
            </span>
          ) : (
            <Bell className="h-4 w-4 shrink-0 text-[#64748b]" />
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#94a3b8]">{alert.description}</p>
      </div>
    </motion.div>
  );
}
