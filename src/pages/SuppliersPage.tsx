import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { ModuleUnavailable } from '@/components/ModuleUnavailable';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppData } from '@/hooks/useAppData';
import { usePermission } from '@/hooks/usePermission';
import { createSupplier, updateSupplier } from '@/services/supplierService';

export function SuppliersPage() {
  const { suppliers, suppliersAvailable, refresh } = useAppData();
  const { isViewOnly } = usePermission();
  const viewOnly = isViewOnly('suppliers');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: '7',
    status: 'Active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      leadTimeDays: '7',
      status: 'Active',
    });
    setDialogOpen(true);
  };

  const openEdit = (supplier: (typeof suppliers)[0]) => {
    setEditingId(supplier.id);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
      leadTimeDays: String(supplier.leadTime),
      status: supplier.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        leadTimeDays: Number(form.leadTimeDays),
        status: form.status,
      };
      if (editingId) {
        await updateSupplier(editingId, payload);
      } else {
        await createSupplier(payload);
      }
      setDialogOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  if (!suppliersAvailable) {
    return (
      <div>
        <PageHeader title="Suppliers" description="Supplier directory for procurement." />
        <ModuleUnavailable
          icon={Users}
          title="Suppliers API unavailable"
          description="Connect to the TileVision API with supplier permissions."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description={
          viewOnly
            ? 'View supplier contacts and lead times linked to warehouse inventory.'
            : 'Manage supplier contacts, lead times, and status.'
        }
        viewOnly={viewOnly}
        actions={
          !viewOnly ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          ) : null
        }
      />

      {suppliers.length === 0 ? (
        <EmptyState icon={Users} title="No suppliers" description="Add your first supplier to support procurement." />
      ) : (
        <div className="glass-card overflow-hidden rounded-2xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.leadTime} days</TableCell>
                  <TableCell>
                    <StatusBadge status={supplier.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {!viewOnly ? (
                      <Button size="sm" variant="outline" onClick={() => openEdit(supplier)}>
                        Edit
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            {[
              ['name', 'Name'],
              ['contactPerson', 'Contact Person'],
              ['email', 'Email'],
              ['phone', 'Phone'],
              ['address', 'Address'],
              ['leadTimeDays', 'Lead Time (days)'],
            ].map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((c) => ({ ...c, [key]: e.target.value }))}
                />
              </div>
            ))}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
