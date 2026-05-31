import { ReactNode } from 'react';
import { useData } from '@/context/DataContext';
import { formatCrudUser, operationBadgeClass, operationLabel } from '@/lib/crudLog';
import { formatDateTime } from '@/lib/store';
import type { CrudOperation } from '@/types';
import { Card, CardHeader, DataTable, EmptyState } from '@/components/ui/Card';

function OpBadge({ op }: { op: CrudOperation | string }) {
  const normalized = (typeof op === 'string' ? op.toLowerCase() : op) as CrudOperation;
  if (!['create', 'update', 'delete'].includes(normalized)) {
    return <span className="inline-flex rounded-lg bg-candy-100 px-2 py-0.5 text-xs font-bold uppercase text-candy-700">{String(op)}</span>;
  }
  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold uppercase ${operationBadgeClass(normalized)}`}>
      {operationLabel(normalized)}
    </span>
  );
}

/** Global CRUD activity — visible on every role page, synced via localStorage */
export function SharedCrudTable({ limit = 25 }: { limit?: number }) {
  const { data } = useData();
  const rows = data.crudRecords.slice(0, limit).map((r) => [
    formatDateTime(r.created_at),
    formatCrudUser(data, r.user_id),
    <OpBadge key={`op-${r.id}`} op={r.operation} />,
    r.entity_type.replace(/_/g, ' '),
    r.record_label,
    r.details ?? '—',
  ]);

  return (
    <Card className="mt-4 min-w-0 border-2 border-accent-light/25 sm:mt-6">
      <CardHeader
        title="System CRUD Activity — All Roles"
        action={<span className="rounded-lg bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{data.crudRecords.length} total records</span>}
      />
      <p className="mb-4 text-sm text-candy-500">
        Every create, update, and delete from any role appears here in real time. All 25 roles share this activity log.
      </p>
      {rows.length === 0 ? (
        <EmptyState message="No CRUD activity yet — create a shipment, PO, or ticket to populate this table." icon="📋" />
      ) : (
        <DataTable headers={['Date', 'User', 'Action', 'Type', 'Record', 'Details']} rows={rows} />
      )}
    </Card>
  );
}

/** Page-specific entity records table */
export function PageRecordsTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <Card className="mt-4 min-w-0 sm:mt-6">
      <CardHeader title={title} action={<span className="text-xs font-semibold text-candy-500">{rows.length} records</span>} />
      <DataTable headers={headers} rows={rows} />
    </Card>
  );
}
