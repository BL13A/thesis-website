import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  Download,
  FileBarChart,
  Package,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Report } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Package,
  AlertTriangle,
  RefreshCw,
  Truck,
  BarChart3,
  FileBarChart,
  clipboard: FileBarChart,
  scan: BarChart3,
  clock: RefreshCw,
  shield: AlertTriangle,
  users: Truck,
  file: FileBarChart,
};

export function ReportCard({
  report,
  index,
  disabled = false,
}: {
  report: Report;
  index: number;
  disabled?: boolean;
}) {
  const Icon = iconMap[report.icon] ?? FileBarChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: disabled ? 0 : -2 }}
    >
      <Card className="glass-card h-full border-border/50 transition-all group hover:border-primary/30">
        <CardContent className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-base font-semibold">{report.title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
          {disabled ? (
            <p className="text-xs text-amber-200/90">Report generation not available yet.</p>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" className="flex-1">
                Generate
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
