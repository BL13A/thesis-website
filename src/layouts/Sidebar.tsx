import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, ScanEye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getNavigationForRole } from '@/config/roleNavigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = user ? getNavigationForRole(user.role) : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <NavLink
        to="/dashboard"
        className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 transition-colors hover:bg-sidebar-accent/30"
        title="Go to Dashboard"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#2563eb] shadow-lg shadow-primary/25">
          <ScanEye className="h-5 w-5 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">TileVision</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Management Portal
          </p>
        </div>
      </NavLink>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.description}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="leading-tight">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
