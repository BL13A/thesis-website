import { useState } from 'react';
import { Pencil, Plus, RotateCcw, Users } from 'lucide-react';
import { ModuleUnavailable } from '@/components/ModuleUnavailable';
import { PageHeader } from '@/components/PageHeader';
import { RoleBadge } from '@/components/RoleBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRoleDisplayLabel, MANAGED_ACCOUNT_ROLES } from '@/utils/roles';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { createUser, resetUserPassword, updateUser } from '@/services/userService';
import type { AccountRole, User, UserStatus } from '@/types';
import { formatDate } from '@/lib/utils';

const EMPTY_FORM = {
  name: '',
  email: '',
  role: 'Warehouse Personnel' as AccountRole,
  department: 'Operations',
  accountStatus: 'Active' as UserStatus,
};

type ConfirmAction = {
  type: 'reset' | 'toggle';
  user: User;
};

export function UsersPage() {
  const { user: sessionUser } = useAuth();
  const { users, usersAvailable, refresh } = useAppData();
  const { can } = usePermission();
  const canManage = can('users:manage') || sessionUser?.role === 'System Administrator';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      accountStatus: user.status,
    });
    setError(null);
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }
    return null;
  };

  const handleSave = async () => {
    if (!canManage) return;
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      if (editing) {
        await updateUser(editing.id, {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          department: form.department.trim(),
          accountStatus: form.accountStatus,
        });
        setFeedback(`Updated account for ${form.name.trim()}.`);
      } else {
        await createUser({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          department: form.department.trim(),
          accountStatus: form.accountStatus,
        });
        setFeedback(`Created account for ${form.name.trim()}.`);
      }
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save user.');
    } finally {
      setSaving(false);
    }
  };

  const runConfirmedAction = async () => {
    if (!confirmAction || !canManage) return;

    const { type, user } = confirmAction;
    setActionUserId(user.id);
    setError(null);
    setFeedback(null);

    try {
      if (type === 'reset') {
        const message = await resetUserPassword(user.id);
        setFeedback(message);
      } else {
        const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active';
        await updateUser(user.id, { accountStatus: nextStatus });
        setFeedback(
          `${user.name} is now ${nextStatus === 'Active' ? 'enabled' : 'disabled'}.`,
        );
      }
      setConfirmAction(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
      setConfirmAction(null);
    } finally {
      setActionUserId(null);
    }
  };

  const isSelf = (user: User) => sessionUser?.id === user.id;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage warehouse, system admin, QA, inventory, and purchasing accounts."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          ) : null
        }
      />

      {feedback ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {feedback}
        </div>
      ) : null}

      {error && !dialogOpen && !confirmAction ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {!usersAvailable || users.length === 0 ? (
        <ModuleUnavailable
          icon={Users}
          title="No users loaded"
          description="Ensure the API is running and you are signed in as System Administrator."
        />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Last Active</TableHead>
                {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.employeeId ?? '—'}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} size="sm" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} />
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{formatDate(user.lastActive)}</TableCell>
                  {canManage ? (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="Edit user"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          title="Reset password"
                          disabled={actionUserId === user.id}
                          onClick={() => setConfirmAction({ type: 'reset', user })}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={user.status === 'Active' ? 'secondary' : 'default'}
                          title={user.status === 'Active' ? 'Disable account' : 'Enable account'}
                          disabled={isSelf(user) || actionUserId === user.id}
                          onClick={() => setConfirmAction({ type: 'toggle', user })}
                        >
                          {user.status === 'Active' ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update account details for this user.'
                : 'Create a new system administrator or warehouse account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) => setForm((current) => ({ ...current, role: value as AccountRole }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MANAGED_ACCOUNT_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleDisplayLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-department">Department</Label>
              <Input
                id="user-department"
                value={form.department}
                onChange={(e) => setForm((current) => ({ ...current, department: e.target.value }))}
              />
            </div>
            {editing ? (
              <>
                <div>
                  <Label htmlFor="user-employee-id">Employee ID</Label>
                  <Input id="user-employee-id" value={editing.employeeId ?? '—'} disabled />
                </div>
                <div>
                  <Label>Account Status</Label>
                  <Select
                    value={form.accountStatus}
                    onValueChange={(value) =>
                      setForm((current) => ({ ...current, accountStatus: value as UserStatus }))
                    }
                    disabled={isSelf(editing)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Employee ID will be assigned automatically (numeric only, e.g. 1042002).
              </p>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button disabled={saving} onClick={() => void handleSave()}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'reset' ? 'Reset Password' : 'Change Account Status'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === 'reset'
                ? `Reset password for ${confirmAction.user.name} to the default (password123)?`
                : confirmAction?.user.status === 'Active'
                  ? `Disable ${confirmAction?.user.name}? They will not be able to sign in.`
                  : `Enable ${confirmAction?.user.name}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={!!actionUserId}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type === 'toggle' && confirmAction.user.status === 'Active' ? 'destructive' : 'default'}
              disabled={!!actionUserId}
              onClick={() => void runConfirmedAction()}
            >
              {actionUserId ? 'Working...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
