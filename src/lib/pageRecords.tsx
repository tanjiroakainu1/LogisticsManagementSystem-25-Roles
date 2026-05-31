import type { ReactNode } from 'react';
import type { AppData, AuthUser, RoleKey } from '@/types';
import { getRoleLabel } from '@/config/roles';
import { formatCurrency, formatDateTime, getUserById } from '@/lib/store';
import { formatCrudUser } from '@/lib/crudLog';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface PageTableConfig {
  title: string;
  headers: string[];
  rows: (string | ReactNode)[][];
}

export function getPageRecordsTable(data: AppData, role: RoleKey, pageKey: string, user: AuthUser): PageTableConfig | null {
  const uid = user.id;

  // Pages with custom action UI — skip duplicate read-only table
  if (role === 'super-admin' && pageKey === 'users') return null;
  if (role === 'finance-officer' && pageKey === 'invoices') return null;
  if (role === 'finance-officer' && pageKey === 'payments') return null;
  if (role === 'finance-officer' && pageKey === 'costs') return null;
  if ((role === 'driver' || role === 'delivery-personnel') && pageKey === 'deliveries') return null;
  if (role === 'customer-service' && pageKey === 'inquiries') return null;
  if (role === 'data-analyst' && ['performance', 'dashboard', 'kpis', 'trends'].includes(pageKey)) return null;
  if (role === 'auditor' && ['transactions', 'compliance'].includes(pageKey)) return null;
  if (role === 'security-officer' && ['security', 'access-logs', 'users-access'].includes(pageKey)) return null;
  if (role === 'dispatcher' && ['assign', 'schedule', 'monitor', 'routes'].includes(pageKey)) return null;
  if (role === 'logistics-manager' && ['staff', 'approve', 'shipments'].includes(pageKey)) return null;
  if (role === 'operations-manager' && ['tasks', 'assign'].includes(pageKey)) return null;
  if (role === 'warehouse-manager' && ['activities', 'approve-movements', 'inventory'].includes(pageKey)) return null;
  if (role === 'inventory-controller' && ['transfers', 'update-records', 'audit', 'stock'].includes(pageKey)) return null;
  if (role === 'fleet-manager' && ['vehicles', 'fuel', 'repairs', 'maintenance'].includes(pageKey)) return null;
  if (role === 'driver' && ['update-status', 'proof-of-delivery', 'incidents'].includes(pageKey)) return null;
  if (role === 'delivery-personnel' && ['progress', 'signatures', 'evidence'].includes(pageKey)) return null;
  if (role === 'procurement-officer' && ['purchases', 'create-po', 'incoming', 'vendors'].includes(pageKey)) return null;
  if (role === 'supplier-vendor' && ['confirm', 'shipment-info', 'purchase-orders'].includes(pageKey)) return null;
  if (role === 'customer' && ['create-shipment', 'track', 'history', 'notifications'].includes(pageKey)) return null;
  if (role === 'route-planner' && ['routes', 'optimize', 'schedules'].includes(pageKey)) return null;
  if (role === 'transport-coordinator' && ['assignments', 'coordinate', 'monitor'].includes(pageKey)) return null;
  if (role === 'quality-assurance' && ['inspect', 'damaged-items', 'compliance'].includes(pageKey)) return null;
  if (role === 'maintenance-technician' && ['records', 'repairs', 'schedule', 'jobs'].includes(pageKey)) return null;
  if (role === 'branch-manager' && ['branch-ops', 'warehouse', 'staff'].includes(pageKey)) return null;
  if (role === 'shipment-coordinator' && ['process', 'track', 'coordinate'].includes(pageKey)) return null;
  if (role === 'packing-staff' && ['pack', 'verify', 'records'].includes(pageKey)) return null;
  if (role === 'loading-unloading-staff' && ['load', 'unload', 'cargo-status', 'report-damage'].includes(pageKey)) return null;
  if (pageKey === 'backup' || pageKey === 'settings') return null;

  // Dashboard — show cross-role connected records from localStorage
  if (pageKey === 'index') {
    return {
      title: 'Connected System Records',
      headers: ['Date', 'User', 'Action', 'Record', 'Details'],
      rows: data.crudRecords.slice(0, 12).map((r) => [
        formatDateTime(r.created_at),
        formatCrudUser(data, r.user_id),
        r.operation.toUpperCase(),
        r.record_label,
        r.details ?? '—',
      ]),
    };
  }

  // Shipments pipeline pages
  if (['create-shipment', 'track', 'history', 'shipments', 'monitor', 'coordinate', 'process', 'pack', 'inspect', 'load', 'unload', 'cargo-status', 'report-damage', 'shipment-info', 'track'].includes(pageKey) || pageKey.includes('shipment')) {
    const list = role === 'customer' ? data.shipments.filter((s) => s.customer_id === uid) : data.shipments;
    return {
      title: 'Shipment Records',
      headers: ['Tracking', 'Route', 'Status', 'Priority', 'Updated'],
      rows: list.slice(0, 25).map((s) => [
        s.tracking_number,
        `${s.origin} → ${s.destination}`,
        <StatusBadge key={s.id} status={s.status} />,
        s.priority,
        formatDateTime(s.updated_at),
      ]),
    };
  }

  if (['invoices', 'payments', 'costs', 'transactions'].includes(pageKey)) {
    const list = role === 'customer' ? data.invoices.filter((i) => i.customer_id === uid) : data.invoices;
    return {
      title: 'Invoice & Payment Records',
      headers: ['Invoice #', 'Amount', 'Status', 'Due', 'Created'],
      rows: list.map((i) => [
        i.invoice_number,
        formatCurrency(i.amount),
        <StatusBadge key={i.id} status={i.status} />,
        i.due_date,
        formatDateTime(i.created_at),
      ]),
    };
  }

  if (['purchases', 'create-po', 'purchase-orders', 'confirm', 'vendors', 'incoming'].includes(pageKey)) {
    const list = role === 'supplier-vendor' ? data.purchaseOrders.filter((p) => p.supplier_id === uid) : data.purchaseOrders;
    return {
      title: 'Purchase Order Records',
      headers: ['PO #', 'Supplier/Officer', 'Amount', 'Status', 'Created'],
      rows: list.map((p) => [
        p.po_number,
        role === 'supplier-vendor'
          ? getUserById(data, p.procurement_officer_id)?.full_name ?? '—'
          : getUserById(data, p.supplier_id)?.full_name ?? '—',
        formatCurrency(p.total_amount),
        <StatusBadge key={p.id} status={p.status} />,
        formatDateTime(p.created_at),
      ]),
    };
  }

  if (pageKey === 'users' || pageKey === 'staff' || pageKey === 'users-access') {
    return {
      title: 'User Records',
      headers: ['Name', 'Email', 'Role', 'Status', 'Joined'],
      rows: data.users.map((u) => [
        u.full_name,
        u.email,
        getRoleLabel(u.role),
        <StatusBadge key={u.id} status={u.status} />,
        formatDateTime(u.created_at),
      ]),
    };
  }

  if (['vehicles', 'fuel', 'maintenance', 'repairs', 'records', 'jobs', 'schedule'].includes(pageKey)) {
    if (pageKey === 'fuel') {
      return {
        title: 'Fuel Log Records',
        headers: ['Vehicle', 'Liters', 'Cost', 'Logged By', 'Date'],
        rows: data.fuelLogs.map((f) => {
          const v = data.vehicles.find((x) => x.id === f.vehicle_id);
          const logger = getUserById(data, f.logged_by);
          return [v?.plate_number ?? '—', f.liters, formatCurrency(f.cost), logger?.full_name ?? '—', formatDateTime(f.logged_at)];
        }),
      };
    }
    if (pageKey === 'jobs' || pageKey === 'schedule' || pageKey === 'records' || pageKey === 'repairs' || pageKey === 'maintenance') {
      return {
        title: 'Maintenance Records',
        headers: ['Vehicle', 'Type', 'Status', 'Scheduled', 'Cost'],
        rows: data.vehicleMaintenance.map((m) => {
          const v = data.vehicles.find((x) => x.id === m.vehicle_id);
          return [v?.plate_number ?? '—', m.type, <StatusBadge key={m.id} status={m.status} />, m.scheduled_date, formatCurrency(m.cost)];
        }),
      };
    }
    return {
      title: 'Fleet Records',
      headers: ['Plate', 'Model', 'Type', 'Fuel', 'Status'],
      rows: data.vehicles.map((v) => [v.plate_number, v.model, v.type, `${v.fuel_level}%`, <StatusBadge key={v.id} status={v.status} />]),
    };
  }

  if (['tasks', 'assign', 'workflow'].includes(pageKey) && role === 'operations-manager') {
    return {
      title: 'Task Records',
      headers: ['Title', 'Assigned To', 'Status', 'Due', 'Created'],
      rows: data.operationalTasks.map((t) => [
        t.title,
        getUserById(data, t.assigned_to)?.full_name ?? '—',
        <StatusBadge key={t.id} status={t.status} />,
        t.due_date ?? '—',
        formatDateTime(t.created_at),
      ]),
    };
  }

  if (['inventory', 'stock', 'warehouse', 'transfers', 'update-records', 'audit', 'approve-movements', 'activities'].includes(pageKey)) {
    if (pageKey === 'transfers' || pageKey === 'approve-movements') {
      return {
        title: 'Stock Movement Records',
        headers: ['Item', 'Type', 'Qty', 'Status', 'Requested'],
        rows: data.stockMovements.map((m) => {
          const item = data.inventoryItems.find((i) => i.id === m.item_id);
          return [item?.name ?? '—', m.movement_type, m.quantity, <StatusBadge key={m.id} status={m.status} />, formatDateTime(m.created_at)];
        }),
      };
    }
    return {
      title: 'Inventory Records',
      headers: ['SKU', 'Name', 'Qty', 'Min', 'Status'],
      rows: data.inventoryItems.map((i) => [i.sku, i.name, i.quantity, i.min_quantity, <StatusBadge key={i.id} status={i.status} />]),
    };
  }

  if (['routes', 'optimize', 'schedules', 'efficiency'].includes(pageKey)) {
    return {
      title: 'Route Records',
      headers: ['Route', 'Distance', 'Status', 'Planner'],
      rows: data.deliveryRoutes.map((r) => [
        r.route_name,
        `${r.distance_km} km`,
        <StatusBadge key={r.id} status={r.status} />,
        getUserById(data, r.planner_id ?? 0)?.full_name ?? '—',
      ]),
    };
  }

  if (['assign', 'deliveries', 'assignments', 'coordinate', 'monitor'].includes(pageKey) && ['dispatcher', 'driver', 'delivery-personnel', 'transport-coordinator'].includes(role)) {
    const list = role === 'driver' || role === 'delivery-personnel'
      ? data.deliveryAssignments.filter((a) => a.driver_id === uid)
      : data.deliveryAssignments;
    return {
      title: 'Delivery Assignment Records',
      headers: ['Tracking', 'Driver', 'Vehicle', 'Status', 'Assigned'],
      rows: list.map((a) => {
        const s = data.shipments.find((x) => x.id === a.shipment_id);
        const driver = getUserById(data, a.driver_id);
        const vehicle = data.vehicles.find((v) => v.id === a.vehicle_id);
        return [s?.tracking_number ?? '—', driver?.full_name ?? '—', vehicle?.plate_number ?? '—', <StatusBadge key={a.id} status={a.status} />, formatDateTime(a.assigned_at)];
      }),
    };
  }

  if (['resolve', 'inquiries', 'requests'].includes(pageKey)) {
    return {
      title: 'Support Ticket Records',
      headers: ['Ticket #', 'Subject', 'Priority', 'Status', 'Created'],
      rows: data.supportTickets.map((t) => [
        t.ticket_number,
        t.subject,
        t.priority,
        <StatusBadge key={t.id} status={t.status} />,
        formatDateTime(t.created_at),
      ]),
    };
  }

  if (pageKey === 'approve') {
    return {
      title: 'Logistics Plan Records',
      headers: ['Plan', 'Status', 'Created By', 'Created'],
      rows: data.logisticsPlans.map((p) => [
        p.title,
        <StatusBadge key={p.id} status={p.status} />,
        getUserById(data, p.created_by)?.full_name ?? '—',
        formatDateTime(p.created_at),
      ]),
    };
  }

  if (['pack', 'verify', 'records'].includes(pageKey) && role === 'packing-staff') {
    return {
      title: 'Packing Records',
      headers: ['Shipment', 'Packer', 'Verified', 'Packed At'],
      rows: data.packingRecords.map((r) => {
        const s = data.shipments.find((x) => x.id === r.shipment_id);
        const packer = getUserById(data, r.packer_id);
        return [s?.tracking_number ?? '—', packer?.full_name ?? '—', r.verified ? 'Yes' : 'No', formatDateTime(r.packed_at)];
      }),
    };
  }

  if (pageKey === 'inspect' || (pageKey === 'compliance' && role === 'quality-assurance')) {
    return {
      title: 'QA Inspection Records',
      headers: ['Shipment', 'Result', 'Inspector', 'Inspected'],
      rows: data.qualityInspections.map((q) => {
        const s = data.shipments.find((x) => x.id === q.shipment_id);
        const inspector = getUserById(data, q.inspector_id);
        return [s?.tracking_number ?? '—', <StatusBadge key={q.id} status={q.result} />, inspector?.full_name ?? '—', formatDateTime(q.inspected_at)];
      }),
    };
  }

  if (pageKey === 'notifications') {
    const notifs = data.notifications.filter((n) => n.user_id === uid);
    return {
      title: 'Notification Records',
      headers: ['Title', 'Message', 'Read', 'Date'],
      rows: notifs.map((n) => [n.title, n.message, n.is_read ? 'Yes' : 'No', formatDateTime(n.created_at)]),
    };
  }

  if (['access-logs', 'security'].includes(pageKey)) {
    return {
      title: 'Access Log Records',
      headers: ['Email', 'Action', 'Date'],
      rows: data.accessLogs.slice(0, 30).map((a) => [a.email, a.action, formatDateTime(a.created_at)]),
    };
  }

  if (pageKey === 'branch-ops' || (pageKey === 'warehouse' && role === 'branch-manager')) {
    const branchId = user.branch_id;
    const list = branchId ? data.shipments.filter((s) => s.branch_id === branchId) : data.shipments;
    return {
      title: 'Branch Shipment Records',
      headers: ['Tracking', 'Route', 'Status', 'Priority', 'Updated'],
      rows: list.map((s) => [s.tracking_number, `${s.origin} → ${s.destination}`, <StatusBadge key={s.id} status={s.status} />, s.priority, formatDateTime(s.updated_at)]),
    };
  }

  if (pageKey === 'damaged-items') {
    return {
      title: 'Damage Report Records',
      headers: ['Shipment', 'Staff', 'Notes', 'Date'],
      rows: data.loadingRecords.filter((r) => r.condition_status === 'damaged').map((r) => {
        const s = data.shipments.find((x) => x.id === r.shipment_id);
        const staff = getUserById(data, r.staff_id);
        return [s?.tracking_number ?? '—', staff?.full_name ?? '—', r.damage_notes ?? '—', formatDateTime(r.recorded_at)];
      }),
    };
  }

  if (['workflow', 'performance', 'branch-reports'].includes(pageKey)) {
    return {
      title: 'Operational Records',
      headers: ['Title', 'Assigned To', 'Status', 'Due'],
      rows: data.operationalTasks.map((t) => [
        t.title,
        getUserById(data, t.assigned_to)?.full_name ?? '—',
        <StatusBadge key={t.id} status={t.status} />,
        t.due_date ?? '—',
      ]),
    };
  }

  if (['reports', 'audit-reports', 'transactions', 'compliance'].includes(pageKey) && role === 'auditor') {
    return {
      title: 'Audit Trail Records',
      headers: ['User', 'Action', 'Entity', 'Details', 'Date'],
      rows: data.auditLogs.slice(0, 30).map((a) => [
        getUserById(data, a.user_id ?? 0)?.full_name ?? 'System',
        a.action,
        a.entity_type,
        a.details ?? '—',
        formatDateTime(a.created_at),
      ]),
    };
  }

  // Dashboard & generic pages — show recent CRUD for this role
  const roleRecords = data.crudRecords.filter((r) => r.user_role === role).slice(0, 15);
  if (roleRecords.length === 0) return null;

  return {
    title: `${getRoleLabel(role)} Recent Activity`,
    headers: ['Date', 'Action', 'Record', 'Details'],
    rows: roleRecords.map((r) => [
      formatDateTime(r.created_at),
      r.operation.toUpperCase(),
      r.record_label,
      r.details ?? '—',
    ]),
  };
}
