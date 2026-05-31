import type { AppData, AuthUser, CrudOperation, RoleKey } from '@/types';
import { getRoleLabel } from '@/config/roles';
import { getUserById, nextId } from './store';

function ts(): string {
  return new Date().toISOString();
}

/** Log a CRUD action — visible to all roles in the shared records table */
export function logCrud(
  data: AppData,
  user: AuthUser | { id: number; role: RoleKey } | null,
  operation: CrudOperation,
  entityType: string,
  entityId: number | null,
  recordLabel: string,
  details?: string
): void {
  if (!data.crudRecords) data.crudRecords = [];
  if (!data.auditLogs) data.auditLogs = [];
  if (!data.nextId.crudRecords) data.nextId.crudRecords = data.crudRecords.length + 1;

  const userId = user?.id ?? 0;
  const userRole = user?.role ?? 'super-admin';

  data.crudRecords.unshift({
    id: nextId(data, 'crudRecords'),
    user_id: userId,
    user_role: userRole,
    operation,
    entity_type: entityType,
    entity_id: entityId,
    record_label: recordLabel,
    details,
    created_at: ts(),
  });

  data.auditLogs.unshift({
    id: nextId(data, 'auditLogs'),
    user_id: userId || null,
    action: `${operation}_${entityType}`,
    entity_type: entityType,
    entity_id: entityId,
    details: details ? `${recordLabel} — ${details}` : recordLabel,
    created_at: ts(),
  });
}

export function operationLabel(op: CrudOperation): string {
  return op === 'create' ? 'Create' : op === 'update' ? 'Update' : 'Delete';
}

export function operationBadgeClass(op: CrudOperation): string {
  if (op === 'create') return 'bg-pastel-mint text-candy-800';
  if (op === 'update') return 'bg-pastel-sky text-candy-800';
  return 'bg-pastel-rose text-candy-800';
}

export function formatCrudUser(data: AppData, userId: number): string {
  if (!userId) return 'System';
  const u = getUserById(data, userId);
  return u ? `${u.full_name} (${getRoleLabel(u.role)})` : `User #${userId}`;
}
