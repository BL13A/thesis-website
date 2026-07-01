import { apiRequest, ApiError, getApiBaseUrl } from '@/services/apiClient';
import { mapApiAccountUser, type ApiUser } from '@/utils/apiMappers';
import { MANAGED_ACCOUNT_ROLES } from '@/utils/roles';
import type { AccountRole, User, UserStatus } from '@/types';

type ApiSuccess<T> = T & { success: boolean; error?: string };

function assertApiSuccess<T extends { success: boolean; error?: string }>(
  result: T,
  fallbackMessage: string,
): T {
  if (!result.success) {
    throw new ApiError(result.error ?? fallbackMessage, 400);
  }
  return result;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: AccountRole | string;
  department?: string;
  employeeId?: string;
  mobileNumber?: string;
  accountStatus?: UserStatus;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: AccountRole | string;
  department?: string;
  employeeId?: string;
  mobileNumber?: string;
  accountStatus?: UserStatus;
}

export async function fetchUsers(): Promise<{ users: User[]; available: boolean }> {
  try {
    const result = await apiRequest<{ success: boolean; users: ApiUser[] }>(
      `${getApiBaseUrl()}/api/users`,
      { auth: true },
    );
    const users = (result.users ?? [])
      .map((row) => mapApiAccountUser(row))
      .filter((user) => MANAGED_ACCOUNT_ROLES.includes(user.role));
    return { users, available: true };
  } catch {
    return { users: [], available: false };
  }
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const result = await apiRequest<ApiSuccess<{ user: ApiUser }>>(
    `${getApiBaseUrl()}/api/users`,
    { method: 'POST', body: payload, auth: true },
  );
  assertApiSuccess(result, 'Unable to create user.');
  return mapApiAccountUser(result.user);
}

export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<User> {
  const result = await apiRequest<ApiSuccess<{ user: ApiUser }>>(
    `${getApiBaseUrl()}/api/users/${userId}`,
    { method: 'PATCH', body: payload, auth: true },
  );
  assertApiSuccess(result, 'Unable to update user.');
  return mapApiAccountUser(result.user);
}

export async function resetUserPassword(userId: string): Promise<string> {
  const result = await apiRequest<ApiSuccess<{ message?: string }>>(
    `${getApiBaseUrl()}/api/users/${userId}/reset-password`,
    { method: 'POST', auth: true },
  );
  assertApiSuccess(result, 'Unable to reset password.');
  return result.message ?? 'Password reset to the default.';
}
