import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchInspections, submitQaReview } from '@/services/inspectionService';
import type { Inspection } from '@/types';

export function useInspections() {
  const { user, isLoading: authLoading } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setInspections([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const records = await fetchInspections();
      setInspections(records);
    } catch (err) {
      setInspections([]);
      setError(err instanceof Error ? err.message : 'Unable to load inspections.');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const reviewInspection = useCallback(
    async (id: string, qaStatus: 'Passed' | 'Rejected', remarks: string, reviewerName: string) => {
      const updated = await submitQaReview(id, qaStatus, remarks, reviewerName);
      setInspections((current) => current.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    [],
  );

  return {
    inspections,
    isLoading: authLoading || isLoading,
    error,
    reload,
    reviewInspection,
  };
}
