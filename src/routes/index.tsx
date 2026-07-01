import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { AIRecognitionPage } from '@/pages/AIRecognitionPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { AuditLogPage } from '@/pages/AuditLogPage';
import { BatchesPage } from '@/pages/BatchesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { InspectionsPage } from '@/pages/InspectionsPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { LoginPage } from '@/pages/LoginPage';
import { ManualReviewPage } from '@/pages/ManualReviewPage';
import { ProcurementPage } from '@/pages/ProcurementPage';
import { ReorderAlertsPage } from '@/pages/ReorderAlertsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SuppliersPage } from '@/pages/SuppliersPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { UsersPage } from '@/pages/UsersPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';

function roleElement(path: Parameters<typeof RoleRoute>[0]['path'], element: ReactNode) {
  return <RoleRoute path={path}>{element}</RoleRoute>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="access-denied" element={<AccessDeniedPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={roleElement('/inventory', <InventoryPage />)} />
        <Route path="ai-recognition" element={roleElement('/ai-recognition', <AIRecognitionPage />)} />
        <Route path="procurement" element={roleElement('/procurement', <ProcurementPage />)} />
        <Route path="suppliers" element={roleElement('/suppliers', <SuppliersPage />)} />
        <Route path="batches" element={roleElement('/batches', <BatchesPage />)} />
        <Route path="inspections" element={roleElement('/inspections', <InspectionsPage />)} />
        <Route path="manual-review" element={roleElement('/manual-review', <ManualReviewPage />)} />
        <Route path="reorder-alerts" element={roleElement('/reorder-alerts', <ReorderAlertsPage />)} />
        <Route path="reports" element={roleElement('/reports', <ReportsPage />)} />
        <Route path="users" element={roleElement('/users', <UsersPage />)} />
        <Route path="audit-log" element={roleElement('/audit-log', <AuditLogPage />)} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
