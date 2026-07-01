import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  ClipboardCheck,
  Download,
  FileBarChart,
  FilePlus,
  Package,
  ScrollText,
  Settings,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuickAction } from '@/types';

const ACTION_ICONS: Record<string, LucideIcon> = {
  qa1: UserPlus,
  qa2: Users,
  qa3: Settings,
  qa4: Shield,
  qa5: ScrollText,
  'qa-qa1': ClipboardCheck,
  'qa-qa2': ThumbsUp,
  'qa-qa3': ThumbsDown,
  'qa-qa4': FileBarChart,
  'inv-qa1': Package,
  'inv-qa2': Download,
  'inv-qa3': Ban,
  'inv-qa4': FileBarChart,
  'pur-qa1': FilePlus,
  'pur-qa2': AlertTriangle,
  'pur-qa3': Truck,
  'pur-qa4': FileBarChart,
};

const ACTION_GRADIENTS = [
  'from-[#3b82f6] to-[#2563eb]',
  'from-[#f59e0b] to-[#d97706]',
  'from-[#22c55e] to-[#16a34a]',
  'from-[#8b5cf6] to-[#7c3aed]',
];

export function QuickActionCard({
  action,
  index,
}: {
  action: QuickAction;
  index: number;
}) {
  const Icon = ACTION_ICONS[action.id] ?? Settings;
  const gradient = ACTION_GRADIENTS[index % ACTION_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 + index * 0.07, duration: 0.35 }}
    >
      <Link
        to={action.href}
        className={cn(
          'group flex items-center gap-4 rounded-xl border border-[rgba(148,163,184,0.12)]',
          'bg-[rgba(15,23,42,0.5)] p-4 transition-all duration-200',
          'hover:border-[rgba(59,130,246,0.35)] hover:bg-[rgba(15,23,42,0.72)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.12)]',
        )}
      >
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg',
            gradient,
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#f8fafc]">{action.label}</p>
          <p className="mt-0.5 text-xs text-[#94a3b8]">{action.description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#64748b] transition-transform group-hover:translate-x-0.5 group-hover:text-[#60a5fa]" />
      </Link>
    </motion.div>
  );
}
