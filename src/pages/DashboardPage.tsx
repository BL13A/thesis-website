import { RoleDashboardView } from '@/components/dashboard/RoleDashboardView';
import { useAuth } from '@/hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <RoleDashboardView user={user} />;
}
