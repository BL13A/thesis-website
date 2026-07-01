import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import type { AppNotification } from '@/services/notificationService';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function getNotificationPath(item: AppNotification): string {
  switch (item.type) {
    case 'qa':
      return '/manual-review';
    case 'inspection':
      return '/inspections';
    case 'inventory':
      return '/reorder-alerts';
    case 'procurement':
      return '/procurement';
    case 'supplier':
      return '/suppliers';
    case 'users':
      return '/users';
    case 'delivery':
      return '/batches';
    default:
      return '/dashboard';
  }
}

export function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notificationUnread,
    notificationsAvailable,
    notifications,
    refreshNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAppData();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const initials =
    user?.name
      .split(' ')
      .map((n) => n[0])
      .join('') ?? '?';

  useEffect(() => {
    if (!notificationsOpen) return;

    void refreshNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen, refreshNotifications]);

  const handleNotificationClick = async (item: AppNotification) => {
    setIsUpdating(true);
    try {
      if (!item.read) {
        await markNotificationAsRead(item.id);
      }
      setNotificationsOpen(false);
      navigate(getNotificationPath(item));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (notificationUnread === 0) return;
    setIsUpdating(true);
    try {
      await markAllNotificationsAsRead();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      <div className="ml-auto flex items-center gap-4">
        <div className="relative" ref={panelRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className={cn(
              'relative rounded-lg p-2 transition-colors',
              notificationsOpen
                ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa]'
                : 'hover:bg-[rgba(59,130,246,0.1)]',
            )}
            title={notificationsAvailable ? 'Notifications' : 'Notifications unavailable'}
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-[#94a3b8]" />
            {notificationsAvailable && notificationUnread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white ring-2 ring-[#0b1120]">
                {notificationUnread > 9 ? '9+' : notificationUnread}
              </span>
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/60 bg-[#0f172a] shadow-xl shadow-black/40">
              <div className="flex items-center justify-between gap-2 border-b border-border/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationsAvailable
                      ? `${notificationUnread} unread`
                      : 'Notifications API unavailable'}
                  </p>
                </div>
                {notificationsAvailable && notificationUnread > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-primary"
                    disabled={isUpdating}
                    onClick={() => void handleMarkAllRead()}
                  >
                    Mark all read
                  </Button>
                ) : null}
              </div>
              <ScrollArea className="max-h-72">
                {!notificationsAvailable ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Connect to the TileVision API to load alerts.
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {notifications.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => void handleNotificationClick(item)}
                          className={cn(
                            'w-full px-4 py-3 text-left transition-colors hover:bg-primary/10',
                            !item.read && 'bg-primary/5',
                          )}
                        >
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {item.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground/80">
                            {formatDate(item.date)}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full transition-opacity hover:opacity-90"
          title="Profile"
          aria-label="Open profile"
        >
          <Avatar className="h-9 w-9 ring-2 ring-border/50">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
