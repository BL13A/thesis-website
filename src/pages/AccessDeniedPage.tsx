import { motion } from 'framer-motion';
import { ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RoleBadge } from '@/components/RoleBadge';
import { Button } from '@/components/ui/button';
import { getDefaultRouteForRole } from '@/config/roleAccess';
import { useAuth } from '@/hooks/useAuth';

export function AccessDeniedPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-lg rounded-2xl border border-[rgba(148,163,184,0.12)] p-8 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.12)] ring-1 ring-[rgba(239,68,68,0.2)]">
          <Lock className="h-8 w-8 text-[#f87171]" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">Access Denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#94a3b8]">
          You do not have permission to access this warehouse module.
        </p>

        {user?.role ? (
          <div className="mt-5 flex justify-center">
            <RoleBadge role={user.role} />
          </div>
        ) : null}

        <Button asChild className="mt-8 w-full sm:w-auto" size="lg">
          <Link to={user?.role ? getDefaultRouteForRole(user.role) : '/dashboard'}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
