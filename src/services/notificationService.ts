import { ApiError, apiRequest, getNotificationsApiUrl } from '@/services/apiClient';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  read: boolean;
  relatedId?: string;
}

export async function fetchNotifications(): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
  available: boolean;
}> {
  try {
    const result = await apiRequest<{
      success: boolean;
      notifications?: AppNotification[];
      unreadCount?: number;
    }>(getNotificationsApiUrl('/'), { auth: true });

    return {
      notifications: result.notifications ?? [],
      unreadCount: result.unreadCount ?? 0,
      available: true,
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
      return { notifications: [], unreadCount: 0, available: false };
    }
    throw error;
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiRequest<{ success: boolean }>(getNotificationsApiUrl(`/${notificationId}/read`), {
    method: 'PATCH',
    auth: true,
  });
}

export async function markAllNotificationsRead(): Promise<number> {
  const result = await apiRequest<{ success: boolean; markedRead?: number }>(
    getNotificationsApiUrl('/read-all'),
    { method: 'POST', auth: true },
  );
  return result.markedRead ?? 0;
}
