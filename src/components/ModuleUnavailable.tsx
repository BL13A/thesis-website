import type { LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

export function ModuleUnavailable({
  icon,
  title,
  description = 'This feature is not available yet.',
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return <EmptyState icon={icon} title={title} description={description} />;
}
