import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, KeyRound, LogOut, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatLastLogin } from '@/lib/utils';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProfileInfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3.5',
        !isLast && 'border-b border-border/40',
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
  showDivider = true,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  showDivider?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-primary/5',
        showDivider && 'border-b border-border/40',
        destructive && 'text-destructive hover:bg-destructive/10',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', destructive ? 'text-destructive' : 'text-primary')} />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

type ProfileModal = 'edit' | 'password' | null;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const [activeModal, setActiveModal] = useState<ProfileModal>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({ name: '', email: '', mobileNumber: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user && activeModal === 'edit') {
      setEditForm({
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber ?? '',
      });
      setError(null);
    }
  }, [user, activeModal]);

  const closeModal = () => {
    setActiveModal(null);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError(null);
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!editForm.name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!editForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!editForm.mobileNumber.trim()) {
      setError('Mobile number is required.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await updateProfile({
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      mobileNumber: editForm.mobileNumber.trim(),
    });
    setSaving(false);

    if (result.success) {
      closeModal();
      return;
    }

    setError(result.error ?? 'Unable to save profile.');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError('Current and new password are required.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setSaving(false);

    if (result.success) {
      closeModal();
      return;
    }

    setError(result.error ?? 'Unable to change password.');
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Profile" description="Employee account information" />

      <Card className="mb-8 border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center px-6 py-8 text-center">
          <div className="mb-4 rounded-full border-2 border-primary/35 p-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
              <span className="text-2xl font-bold tracking-wide text-primary">
                {getInitials(user.name)}
              </span>
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
          <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            Employee ID
          </p>
          <p className="text-sm font-semibold tracking-wide text-foreground/90">
            {user.employeeId ?? '—'}
          </p>
          <div className="mt-4 w-full border-t border-border/40 pt-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Last Login</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {formatLastLogin(user.lastActive)}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="mb-3 ml-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Employee Information
      </p>
      <Card className="mb-8 border-border/60 bg-card/80 backdrop-blur-sm">
        <CardContent className="px-5 py-1">
          <ProfileInfoRow label="Full Name" value={user.name} />
          <ProfileInfoRow label="Employee ID" value={user.employeeId ?? '—'} />
          <ProfileInfoRow label="Email" value={user.email} />
          <ProfileInfoRow label="Department" value={user.department} />
          <ProfileInfoRow label="Role" value={user.role} isLast />
        </CardContent>
      </Card>

      <p className="mb-3 ml-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Account Settings
      </p>
      <Card className="mb-4 overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
        <ProfileMenuItem
          icon={Pencil}
          label="Edit Profile"
          onClick={() => setActiveModal('edit')}
        />
        <ProfileMenuItem
          icon={KeyRound}
          label="Change Password"
          onClick={() => setActiveModal('password')}
          showDivider={false}
        />
      </Card>

      <Card className="mb-8 overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
        <ProfileMenuItem
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
          destructive
          showDivider={false}
        />
      </Card>

      <div className="pb-4 text-center">
        <p className="text-sm font-bold text-muted-foreground">TileVision</p>
        <p className="mt-1 text-xs text-muted-foreground">© 2026 TileVision</p>
      </div>

      <Dialog open={activeModal === 'edit'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your employee contact information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={editForm.name}
                onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                type="email"
                value={editForm.email}
                onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-mobile">Mobile Number</Label>
              <Input
                id="profile-mobile"
                value={editForm.mobileNumber}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, mobileNumber: event.target.value }))
                }
              />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="mt-1 text-sm font-semibold">{user.employeeId ?? '—'}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Managed by HR · cannot be edited
              </p>
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" disabled={saving} onClick={() => void handleSaveProfile()}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'password'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="button" disabled={saving} onClick={() => void handleChangePassword()}>
                {saving ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
