import { apiRequest, getInspectionsApiUrl } from '@/services/apiClient';
import { mapApiInspection, type ApiInspectionRecord } from '@/utils/apiMappers';
import type { Inspection, QAStatus } from '@/types';

function mapInspectionRecords(records: ApiInspectionRecord[]): Inspection[] {
  return records
    .map((record) => {
      try {
        return mapApiInspection(record);
      } catch {
        return null;
      }
    })
    .filter((record): record is Inspection => record !== null);
}

export async function fetchInspections(): Promise<Inspection[]> {
  const urls = [getInspectionsApiUrl('/'), getInspectionsApiUrl()];
  let lastError: Error | null = null;

  for (const url of urls) {
    try {
      const result = await apiRequest<{
        success: boolean;
        inspections?: ApiInspectionRecord[];
        error?: string;
      }>(url, { auth: true });

      if (!result.success) {
        throw new Error(result.error ?? 'Unable to load inspections.');
      }

      return mapInspectionRecords(result.inspections ?? []);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unable to load inspections.');
    }
  }

  throw lastError ?? new Error('Unable to load inspections.');
}

export async function submitQaReview(
  id: string,
  qaStatus: Extract<QAStatus, 'Passed' | 'Rejected'>,
  qaRemarks: string,
  reviewerName: string,
): Promise<Inspection> {
  const result = await apiRequest<{ success: boolean; inspection?: ApiInspectionRecord; error?: string }>(
    getInspectionsApiUrl(`/${id}/review`),
    {
      method: 'PATCH',
      auth: true,
      body: { qaStatus, qaRemarks, reviewerName },
    },
  );

  if (!result.success || !result.inspection) {
    throw new Error(result.error ?? 'Unable to update QA review.');
  }

  return mapApiInspection(result.inspection);
}
