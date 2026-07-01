import { Navigate } from 'react-router-dom';
import { canAccessRoute } from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';

export function RoleRoute({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) return null;

  if (!canAccessRoute(user.role, path)) {
    return <Navigate to="/access-denied" replace state={{ from: path }} />;
  }

  return children;
}
