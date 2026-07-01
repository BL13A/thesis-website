import {
  apiRequest,
  clearAccessToken,
  getAccessToken,
  getAuthApiUrl,
  saveAccessToken,
} from '@/services/apiClient';
import { mapApiUser, type ApiUser } from '@/utils/apiMappers';
import type { SessionUser } from '@/types';

interface LoginResponse {
  success: boolean;
  accessToken?: string;
  user?: ApiUser;
  error?: string;
}

interface MeResponse {
  success: boolean;
  user?: ApiUser;
  error?: string;
}

export async function login(email: string, password: string): Promise<{ user: SessionUser } | { error: string }> {
  try {
    const result = await apiRequest<LoginResponse>(getAuthApiUrl('/login'), {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });

    if (!result.success || !result.accessToken || !result.user) {
      return { error: result.error ?? 'Login failed.' };
    }

    const user = mapApiUser(result.user);
    if (!user) {
      clearAccessToken();
      return {
        error:
          'This account is assigned to the mobile warehouse app. Please use the TileVision mobile application.',
      };
    }

    saveAccessToken(result.accessToken);
    return { user };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Login failed.' };
  }
}

export async function fetchCurrentUser(): Promise<SessionUser | null> {
  if (!getAccessToken()) return null;

  try {
    const result = await apiRequest<MeResponse>(getAuthApiUrl('/me'), { auth: true });
    if (!result.success || !result.user) {
      clearAccessToken();
      return null;
    }
    const user = mapApiUser(result.user);
    if (!user) {
      clearAccessToken();
      return null;
    }
    return user;
  } catch {
    clearAccessToken();
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<{ message: string } | { error: string }> {
  try {
    const result = await apiRequest<{ success: boolean; message?: string; error?: string }>(
      getAuthApiUrl('/forgot-password'),
      { method: 'POST', body: { email } },
    );
    if (!result.success) return { error: result.error ?? 'Unable to send reset email.' };
    return { message: result.message ?? 'If an account exists, a reset link has been sent.' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unable to send reset email.' };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiRequest<{ success: boolean; error?: string; message?: string }>(
      getAuthApiUrl('/change-password'),
      {
        method: 'POST',
        auth: true,
        body: { currentPassword, newPassword },
      },
    );

    if (!result.success) {
      return { success: false, error: result.error ?? 'Unable to change password.' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to change password.',
    };
  }
}

export function logout(): void {
  clearAccessToken();
}
