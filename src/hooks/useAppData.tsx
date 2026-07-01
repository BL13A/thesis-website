import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchDeliveries } from '@/services/deliveryService';
import { fetchInspections, submitQaReview } from '@/services/inspectionService';
import { fetchInventory } from '@/services/inventoryService';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notificationService';
import { fetchProcurement } from '@/services/procurementService';
import { fetchSuppliers } from '@/services/supplierService';
import { fetchUsers } from '@/services/userService';
import { fetchWebDashboard, type WebDashboardSummary } from '@/services/warehouseDashboardService';
import type { AppNotification } from '@/services/notificationService';
import type {
  Delivery,
  Inspection,
  InventoryItem,
  ProcurementAlert,
  ProcurementRequest,
  Supplier,
  User,
} from '@/types';

interface AppDataContextValue {
  inspections: Inspection[];
  notifications: AppNotification[];
  notificationUnread: number;
  notificationsAvailable: boolean;
  inventory: InventoryItem[];
  inventoryAvailable: boolean;
  procurementRequests: ProcurementRequest[];
  procurementAlerts: ProcurementAlert[];
  procurementAvailable: boolean;
  suppliers: Supplier[];
  suppliersAvailable: boolean;
  deliveries: Delivery[];
  deliveriesAvailable: boolean;
  dashboardSummary: WebDashboardSummary | null;
  users: User[];
  usersAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  reviewInspection: (
    id: string,
    qaStatus: 'Passed' | 'Rejected',
    remarks: string,
    reviewerName: string,
  ) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

async function loadDeliveries(): Promise<{ items: Delivery[]; available: boolean }> {
  try {
    const items = await fetchDeliveries();
    return { items, available: true };
  } catch {
    return { items: [], available: false };
  }
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationUnread, setNotificationUnread] = useState(0);
  const [notificationsAvailable, setNotificationsAvailable] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryAvailable, setInventoryAvailable] = useState(false);
  const [procurementRequests, setProcurementRequests] = useState<ProcurementRequest[]>([]);
  const [procurementAlerts, setProcurementAlerts] = useState<ProcurementAlert[]>([]);
  const [procurementAvailable, setProcurementAvailable] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersAvailable, setSuppliersAvailable] = useState(false);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [deliveriesAvailable, setDeliveriesAvailable] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<WebDashboardSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersAvailable, setUsersAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [
        inspectionData,
        notificationData,
        inventoryData,
        procurementData,
        supplierData,
        deliveryData,
        dashboardData,
        userData,
      ] = await Promise.all([
        fetchInspections().catch((err) => {
          console.error('Failed to load inspections:', err);
          return [] as Inspection[];
        }),
        fetchNotifications().catch(() => ({ notifications: [], unreadCount: 0, available: false })),
        fetchInventory().catch(() => ({ items: [], available: false })),
        fetchProcurement().catch(() => ({ requests: [], alerts: [], available: false })),
        fetchSuppliers().catch(() => ({ suppliers: [], available: false })),
        loadDeliveries(),
        fetchWebDashboard().catch(() => null),
        fetchUsers().catch(() => ({ users: [], available: false })),
      ]);

      setInspections(inspectionData);
      setNotifications(notificationData.notifications);
      setNotificationUnread(notificationData.unreadCount);
      setNotificationsAvailable(notificationData.available);
      setInventory(inventoryData.items);
      setInventoryAvailable(inventoryData.available);
      setProcurementRequests(procurementData.requests);
      setProcurementAlerts(procurementData.alerts);
      setProcurementAvailable(procurementData.available);
      setSuppliers(supplierData.suppliers);
      setSuppliersAvailable(supplierData.available);
      setDeliveries(deliveryData.items);
      setDeliveriesAvailable(deliveryData.available);
      setDashboardSummary(dashboardData);
      setUsers(userData.users);
      setUsersAvailable(userData.available);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load application data.');
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    const notificationData = await fetchNotifications().catch(() => ({
      notifications: [] as AppNotification[],
      unreadCount: 0,
      available: false,
    }));

    setNotifications(notificationData.notifications);
    setNotificationUnread(notificationData.unreadCount);
    setNotificationsAvailable(notificationData.available);
  }, [user]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)),
    );
    setNotificationUnread((current) => Math.max(0, current - 1));
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    setNotificationUnread(0);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const reviewInspection = useCallback(
    async (id: string, qaStatus: 'Passed' | 'Rejected', remarks: string, reviewerName: string) => {
      const updated = await submitQaReview(id, qaStatus, remarks, reviewerName);
      setInspections((current) => current.map((item) => (item.id === id ? updated : item)));
    },
    [],
  );

  const value = useMemo(
    () => ({
      inspections,
      notifications,
      notificationUnread,
      notificationsAvailable,
      inventory,
      inventoryAvailable,
      procurementRequests,
      procurementAlerts,
      procurementAvailable,
      suppliers,
      suppliersAvailable,
      deliveries,
      deliveriesAvailable,
      dashboardSummary,
      users,
      usersAvailable,
      isLoading,
      error,
      refresh,
      refreshNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      reviewInspection,
    }),
    [
      inspections,
      notifications,
      notificationUnread,
      notificationsAvailable,
      inventory,
      inventoryAvailable,
      procurementRequests,
      procurementAlerts,
      procurementAvailable,
      suppliers,
      suppliersAvailable,
      deliveries,
      deliveriesAvailable,
      dashboardSummary,
      users,
      usersAvailable,
      isLoading,
      error,
      refresh,
      refreshNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      reviewInspection,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}
