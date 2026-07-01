import { apiRequest, getAuthApiUrl } from '@/services/apiClient';
import { mapApiUser, type ApiUser } from '@/utils/apiMappers';
import type { SessionUser } from '@/types';

interface ProfileResponse {
  success: boolean;
  user?: ApiUser;
  error?: string;
}

export async function updateProfileOnApi(updates: {
  name: string;
  email: string;
  mobileNumber: string;
}): Promise<{ success: true; user: SessionUser } | { success: false; error: string }> {
  try {
    const result = await apiRequest<ProfileResponse>(getAuthApiUrl('/profile'), {
      method: 'PATCH',
      auth: true,
      body: updates,
    });

    if (!result.success || !result.user) {
      return { success: false, error: result.error ?? 'Unable to save profile.' };
    }

    const user = mapApiUser(result.user);
    if (!user) {
      return { success: false, error: 'Unable to update profile for this account.' };
    }

    return { success: true, user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to save profile.',
    };
  }
}
