import { motion } from 'framer-motion';
import { ViewOnlyBadge } from '@/components/ViewOnlyBadge';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  viewOnly?: boolean;
}

export function PageHeader({ title, description, actions, viewOnly }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {viewOnly ? <ViewOnlyBadge /> : null}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
