import {
  ALL_USER_ROLES,
  getModuleAccessCell,
  MODULE_LABELS,
  type AppModule,
} from '@/config/rolePermissions';
import { getNavigationForRole } from '@/config/roleNavigation';
import type { UserRole } from '@/types';

const MATRIX_MODULES: AppModule[] = [
  'users',
  'ai-recognition',
  'inspections',
  'inventory',
  'batches',
  'procurement',
  'suppliers',
  'reports',
];

function accessLabel(cell: ReturnType<typeof getModuleAccessCell>): string {
  if (cell === 'full') return 'Full';
  if (cell === 'view-only') return 'View';
  return '—';
}

export function RoleAccessMatrix() {
  return (
    <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
      <div className="border-b border-border/50 px-6 py-4">
        <h3 className="text-lg font-semibold">Role Access Matrix</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Management portal modules and permissions by role. Warehouse Personnel use the mobile app only.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/20 text-left">
              <th className="px-4 py-3 font-medium">Module</th>
              {ALL_USER_ROLES.map((role) => (
                <th key={role} className="px-4 py-3 font-medium">
                  {role.replace('Quality Assurance Manager', 'QA Manager')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_MODULES.map((module) => (
              <tr key={module} className="border-b border-border/40">
                <td className="px-4 py-3 font-medium">{MODULE_LABELS[module]}</td>
                {ALL_USER_ROLES.map((role) => (
                  <td key={`${module}-${role}`} className="px-4 py-3 text-muted-foreground">
                    {accessLabel(getModuleAccessCell(role, module))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 px-6 py-4 text-sm text-muted-foreground">
        {ALL_USER_ROLES.map((role) => {
          const sections = getNavigationForRole(role as UserRole);
          const labels = sections.flatMap((section) => section.items.map((item) => item.label));
          return (
            <p key={role}>
              <span className="font-medium text-foreground">{role}:</span> {labels.join(' · ')}
            </p>
          );
        })}
      </div>
    </div>
  );
}
