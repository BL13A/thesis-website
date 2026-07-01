import { apiRequest, getRecognitionLogsApiUrl } from '@/services/apiClient';
import type { RecognitionLog } from '@/types';

/** Web portal: read-only recognition logs from mobile warehouse scans. */
export async function fetchRecognitionLogs(limit = 100): Promise<RecognitionLog[]> {
  const result = await apiRequest<{ success: boolean; logs: RecognitionLog[] }>(
    `${getRecognitionLogsApiUrl('')}?limit=${limit}`,
    { auth: true },
  );
  return result.logs;
}
