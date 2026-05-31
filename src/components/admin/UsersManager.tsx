import { FormEvent, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ALL_ROLE_KEYS, ROLES, getRoleLabel } from '@/config/roles';
import { createUser, deleteUser, toggleUserStatus, updateUser } from '@/lib/services';
import { formatDateTime } from '@/lib/store';
import type { RoleKey, User, UserStatus } from '@/types';
import { Card, CardHeader, DataTable, EmptyState } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: '' as RoleKey | '',
  branch_id: '',
  phone: '',
  status: 'active' as UserStatus,
};

type FormState = typeof EMPTY_FORM;

function branchName(branches: { id: number; name: string }[], branchId: number | null) {
  if (!branchId) return '—';
  return branches.find((b) => b.id === branchId)?.name ?? `#${branchId}`;
}

function userToForm(u: User): FormState {
  return {
    full_name: u.full_name,
    email: u.email,
    password: '',
    role: u.role,
    branch_id: u.branch_id ? String(u.branch_id) : '',
    phone: u.phone ?? '',
    status: u.status,
  };
}

export function UsersManager({ onFlash }: { onFlash: (message: string) => void }) {
  const { user: admin } = useAuth();
  const { data, update } = useData();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  const roleCounts = useMemo(() => {
    const counts: Partial<Record<RoleKey, number>> = {};
    data.users.forEach((u) => {
      counts[u.role] = (counts[u.role] ?? 0) + 1;
    });
    return counts;
  }, [data.users]);

  if (!admin) return null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError('');
  };

  const handleEdit = (u: User) => {
    setEditId(u.id);
    setForm(userToForm(u));
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (u: User) => {
    if (!confirm(`Delete user "${u.full_name}" (${u.email})?\n\nThis cannot be undone.`)) return;
    update((d) => {
      const result = deleteUser(d, admin, u.id);
      if (result.ok) {
        if (editId === u.id) resetForm();
        onFlash(`Deleted ${u.full_name}`);
      } else {
        onFlash(result.error ?? 'Delete failed');
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.role) {
      setFormError('Please select a role.');
      return;
    }

    if (editId) {
      if (!form.password && form.full_name && form.email) {
        /* password optional on edit */
      }
      update((d) => {
        const result = updateUser(d, admin, editId, {
          full_name: form.full_name,
          email: form.email,
          password: form.password || undefined,
          role: form.role as RoleKey,
          branch_id: form.branch_id ? parseInt(form.branch_id, 10) : null,
          phone: form.phone,
          status: form.status,
        });
        if (result.ok) {
          onFlash(`Updated ${form.full_name}`);
          resetForm();
        } else {
          setFormError(result.error ?? 'Update failed');
        }
      });
      return;
    }

    if (!form.password) {
      setFormError('Password is required for new users.');
      return;
    }

    update((d) => {
      const result = createUser(d, admin, {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role as RoleKey,
        branch_id: form.branch_id ? parseInt(form.branch_id, 10) : null,
        phone: form.phone,
        status: form.status,
      });
      if (result.ok) {
        onFlash(`Created ${form.full_name}`);
        resetForm();
      } else {
        setFormError(result.error ?? 'Create failed');
      }
    });
  };

  const rows = [...data.users]
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .map((u) => [
      u.full_name,
      u.email,
      getRoleLabel(u.role),
      branchName(data.branches, u.branch_id),
      u.phone ?? '—',
      <StatusBadge key={`st-${u.id}`} status={u.status} />,
      formatDateTime(u.created_at),
      <div key={`act-${u.id}`} className="flex min-w-[220px] flex-wrap gap-1.5">
        <button type="button" className="btn btn-sm btn-outline" onClick={() => handleEdit(u)}>Edit</button>
        <button
          type="button"
          className="btn btn-sm btn-outline text-red-600"
          disabled={u.id === admin.id}
          title={u.id === admin.id ? 'Cannot delete yourself' : 'Delete user'}
          onClick={() => handleDelete(u)}
        >
          Delete
        </button>
        {u.status === 'active' ? (
          <button
            type="button"
            className="btn btn-sm btn-outline text-amber-700"
            disabled={u.id === admin.id}
            onClick={() => update((d) => { toggleUserStatus(d, admin, u.id, 'suspended'); onFlash(`Suspended ${u.full_name}`); })}
          >
            Suspend
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => update((d) => { toggleUserStatus(d, admin, u.id, 'active'); onFlash(`Activated ${u.full_name}`); })}
          >
            Activate
          </button>
        )}
      </div>,
    ]);

  return (
    <>
      <Card glow className="mb-4">
        <CardHeader
          title={editId ? 'Edit User' : 'Add New User'}
          action={
            editId ? (
              <button type="button" className="btn btn-sm btn-outline" onClick={resetForm}>Cancel Edit</button>
            ) : (
              <span className="candy-pill">{data.users.length} users · {ALL_ROLE_KEYS.length} roles</span>
            )
          }
        />
        {formError && (
          <div className="mb-4 rounded-xl border border-pastel-rose bg-pastel-rose/80 px-4 py-3 text-sm font-semibold text-candy-800">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
                placeholder="Maria Santos"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="user@gmail.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password {editId ? '(leave blank to keep)' : '*'}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editId}
                minLength={editId ? undefined : 6}
                placeholder={editId ? '••••••••' : 'min. 6 characters'}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+63 9XX XXX XXXX"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role * — all 25 roles</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as RoleKey })}
                required
              >
                <option value="">Select role</option>
                {ALL_ROLE_KEYS.map((r) => (
                  <option key={r} value={r}>
                    {ROLES[r].icon} {getRoleLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Branch</label>
              <select value={form.branch_id} onChange={(e) => setForm({ ...form, branch_id: e.target.value })}>
                <option value="">No branch</option>
                {data.branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="form-group flex justify-end">
              <div className="flex w-full flex-wrap gap-2 sm:mt-6 sm:justify-end">
                {editId && (
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Clear</button>
                )}
                <button type="submit" className="btn btn-primary">
                  {editId ? 'Save Changes' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      <Card className="mb-4">
        <CardHeader title="Users by Role" />
        <div className="flex flex-wrap gap-2">
          {ALL_ROLE_KEYS.map((r) => (
            <span key={r} className="candy-pill">
              {ROLES[r].icon} {getRoleLabel(r)}: <strong>{roleCounts[r] ?? 0}</strong>
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="All Users"
          action={<span className="text-xs font-semibold text-candy-500">{data.users.length} records</span>}
        />
        {rows.length === 0 ? (
          <EmptyState message="No users yet — add one above." icon="👥" />
        ) : (
          <DataTable
            headers={['Name', 'Email', 'Role', 'Branch', 'Phone', 'Status', 'Created', 'Actions']}
            rows={rows}
            minWidth={920}
          />
        )}
      </Card>
    </>
  );
}
