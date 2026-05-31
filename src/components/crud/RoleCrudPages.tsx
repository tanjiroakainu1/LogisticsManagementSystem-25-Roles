import { FormEvent, ReactNode } from 'react';
import type { AppData, AuthUser, RoleKey } from '@/types';
import { getRoleLabel } from '@/config/roles';
import {
  addMaintenanceRecord, addPackingNote, addShipmentTrackingNote, adjustBranchInventory,
  assignBranchTask, assignTransport, coordinateShipment, createComplianceRecord,
  createCustomerTicket, createLogisticsPlan, createStockAudit, createTicketFromShipment, createVehicle,
  deletePurchaseOrder, deleteTask, deleteVehicle, exportAnalyticsSnapshot, flagAuditItem,
  linkRouteToShipment, logLogisticsCost, logSecurityReview, logVendorCoordination, logWarehouseActivity,
  markPOReceived, recordComplianceFinding, recordDeliveryEvent, recordPayment,
  reportDamagedItem, restockItem, scheduleDispatch, updateCargoStatus, updateDispatchStatus,
  updateRepairLog, updateRoute, updateShipmentPriority, updateSupplierShipmentInfo, updateTaskStatus,
  updateUserAccess, updateVehicle,
} from '@/lib/extendedServices';
import { completeMaintenanceJob, confirmPO, scheduleMaintenance, takeTicket, resolveTicket } from '@/lib/services';
import { formatCurrency, formatDateTime, getUserById, getUsersByRole } from '@/lib/store';
import { Card, CardHeader, DataTable, EmptyState } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';

export interface CrudCtx {
  role: RoleKey;
  pageKey: string;
  user: AuthUser;
  data: AppData;
  update: (fn: (d: AppData) => void) => void;
  flash: (m: string) => void;
  shell: (body: ReactNode, megaCharts?: boolean) => ReactNode;
}

function PodForm({ user, data, update, flash, type, label }: {
  user: AuthUser; data: AppData; update: CrudCtx['update']; flash: (m: string) => void;
  type: 'pod' | 'signature' | 'evidence' | 'incident' | 'progress'; label: string;
}) {
  const mine = data.deliveryAssignments.filter((a) => a.driver_id === user.id && a.status !== 'delivered');
  if (!mine.length) return <Card><EmptyState message="No active deliveries" /></Card>;
  return (<>{mine.map((a) => { const s = data.shipments.find((x) => x.id === a.shipment_id); return (
    <Card key={a.id} className="mb-4"><CardHeader title={s?.tracking_number ?? 'Delivery'} />
      <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => recordDeliveryEvent(d, user, a.id, type, fd.get('notes') as string)); flash('Recorded'); e.currentTarget.reset(); }} className="space-y-3">
        <div className="form-group"><label>{label} *</label><textarea name="notes" required rows={2} /></div>
        <button type="submit" className="btn btn-primary btn-sm">Submit</button>
      </form>
    </Card>); })}</>);
}

export function renderRoleCrudPages(ctx: CrudCtx): ReactNode | null {
  const { role, pageKey, user, data, update, flash, shell } = ctx;

  if (role === 'fleet-manager' && pageKey === 'vehicles') {
    return shell(<>
      <Card glow><CardHeader title="Add Vehicle" />
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createVehicle(d, user, { plate_number: fd.get('plate') as string, model: fd.get('model') as string, type: fd.get('type') as 'truck' | 'van' | 'motorcycle' | 'container', capacity_kg: parseFloat(fd.get('capacity') as string) || 1000 })); flash('Vehicle added'); e.currentTarget.reset(); }} className="space-y-4">
          <div className="form-row"><div className="form-group"><label>Plate *</label><input name="plate" required /></div><div className="form-group"><label>Model *</label><input name="model" required /></div></div>
          <div className="form-row"><div className="form-group"><label>Type</label><select name="type"><option value="truck">Truck</option><option value="van">Van</option><option value="motorcycle">Motorcycle</option><option value="container">Container</option></select></div><div className="form-group"><label>Capacity kg</label><input name="capacity" type="number" defaultValue={1000} /></div></div>
          <button type="submit" className="btn btn-primary">Add Vehicle</button>
        </form>
      </Card>
      <Card className="mt-4"><CardHeader title="Fleet Registry" />
        <DataTable headers={['Plate', 'Model', 'Status', 'Fuel', 'Actions']} rows={data.vehicles.map((v) => [v.plate_number, v.model, <StatusBadge key={`s-${v.id}`} status={v.status} />, `${v.fuel_level}%`, <div key={`a-${v.id}`} className="flex flex-wrap gap-1"><button type="button" className="btn btn-sm btn-outline" onClick={() => { update((d) => updateVehicle(d, user, v.id, { status: v.status === 'available' ? 'maintenance' : 'available' })); flash('Updated'); }}>Toggle</button><button type="button" className="btn btn-sm btn-outline text-red-600" disabled={v.status === 'in_use'} onClick={() => { if (confirm('Delete?')) update((d) => { deleteVehicle(d, user, v.id); flash('Deleted'); }); }}>Delete</button></div>])} />
      </Card>
    </>);
  }

  if (role === 'fleet-manager' && pageKey === 'repairs') {
    return shell(<Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => scheduleMaintenance(d, user, parseInt(fd.get('vehicle_id') as string), fd.get('type') as string, fd.get('date') as string)); flash('Repair scheduled'); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>Vehicle *</label><select name="vehicle_id" required>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div><div className="form-group"><label>Type *</label><input name="type" required /></div></div>
      <div className="form-group"><label>Date *</label><input name="date" type="date" required /></div><button type="submit" className="btn btn-primary">Schedule Repair</button>
    </form></Card>);
  }

  if (role === 'logistics-manager' && pageKey === 'staff') {
    const staff = data.users.filter((u) => ['logistics-manager', 'shipment-coordinator', 'dispatcher', 'route-planner'].includes(u.role));
    return shell(<><Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createLogisticsPlan(d, user, fd.get('title') as string, fd.get('description') as string)); flash('Plan submitted'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Plan Title *</label><input name="title" required /></div><div className="form-group"><label>Description</label><textarea name="description" rows={3} /></div><button type="submit" className="btn btn-primary">Submit Plan</button>
    </form></Card><Card className="mt-4"><CardHeader title="Logistics Staff" /><DataTable headers={['Name', 'Role', 'Status']} rows={staff.map((u) => [u.full_name, getRoleLabel(u.role), <StatusBadge key={u.id} status={u.status} />])} /></Card></>);
  }

  if (role === 'operations-manager' && pageKey === 'tasks') {
    return shell(<Card><CardHeader title="Operations Tasks" /><DataTable headers={['Title', 'Assignee', 'Status', 'Actions']} rows={data.operationalTasks.map((t) => [t.title, getUserById(data, t.assigned_to)?.full_name ?? '—', <StatusBadge key={t.id} status={t.status} />, <div key={`t-${t.id}`} className="flex gap-1 flex-wrap">{t.status !== 'completed' && <button type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateTaskStatus(d, user, t.id, 'completed')); flash('Done'); }}>Complete</button>}<button type="button" className="btn btn-sm btn-outline text-red-600" onClick={() => { update((d) => deleteTask(d, user, t.id)); flash('Deleted'); }}>Delete</button></div>])} /></Card>);
  }

  if (role === 'warehouse-manager' && pageKey === 'activities') {
    return shell(<Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => logWarehouseActivity(d, user, fd.get('activity') as string, fd.get('notes') as string)); flash('Logged'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Activity *</label><input name="activity" required /></div><div className="form-group"><label>Notes</label><textarea name="notes" rows={2} /></div><button type="submit" className="btn btn-primary">Log Activity</button>
    </form></Card>);
  }

  if (role === 'inventory-controller' && pageKey === 'audit') {
    return shell(<Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createStockAudit(d, user, parseInt(fd.get('item_id') as string), parseInt(fd.get('qty') as string), fd.get('notes') as string)); flash('Audit saved'); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>Item *</label><select name="item_id" required>{data.inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div><div className="form-group"><label>Qty *</label><input name="qty" type="number" required /></div></div>
      <div className="form-group"><label>Notes *</label><textarea name="notes" required rows={2} /></div><button type="submit" className="btn btn-primary">Submit Audit</button>
    </form></Card>);
  }

  if (role === 'driver' && pageKey === 'proof-of-delivery') return shell(<PodForm user={user} data={data} update={update} flash={flash} type="pod" label="POD Notes" />);
  if (role === 'driver' && pageKey === 'incidents') return shell(<PodForm user={user} data={data} update={update} flash={flash} type="incident" label="Incident Report" />);
  if (role === 'delivery-personnel' && pageKey === 'progress') return shell(<PodForm user={user} data={data} update={update} flash={flash} type="progress" label="Progress Update" />);
  if (role === 'delivery-personnel' && pageKey === 'signatures') return shell(<PodForm user={user} data={data} update={update} flash={flash} type="signature" label="Signature / Recipient" />);
  if (role === 'delivery-personnel' && pageKey === 'evidence') return shell(<PodForm user={user} data={data} update={update} flash={flash} type="evidence" label="Evidence Notes" />);

  if (role === 'supplier-vendor' && pageKey === 'shipment-info') {
    const pos = data.purchaseOrders.filter((p) => p.supplier_id === user.id);
    return shell(<>{pos.map((p) => (<Card key={p.id} className="mb-4"><CardHeader title={p.po_number} /><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => updateSupplierShipmentInfo(d, user, p.id, fd.get('info') as string, fd.get('date') as string)); flash('Updated'); }} className="space-y-3"><div className="form-group"><label>Update</label><textarea name="info" required rows={2} /></div><div className="form-group"><label>Expected Date</label><input name="date" type="date" /></div><button type="submit" className="btn btn-primary btn-sm">Save</button></form></Card>))}</>);
  }

  if (role === 'transport-coordinator' && pageKey === 'assignments') {
    const ready = data.shipments.filter((s) => ['loaded', 'dispatched'].includes(s.status));
    const drivers = [...getUsersByRole(data, 'driver'), ...getUsersByRole(data, 'delivery-personnel')];
    const vehicles = data.vehicles.filter((v) => v.status === 'available');
    return shell(<>{ready.length === 0 ? <Card><EmptyState message="No shipments ready" /></Card> : ready.map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => assignTransport(d, user, { shipment_id: s.id, driver_id: parseInt(fd.get('driver_id') as string), vehicle_id: parseInt(fd.get('vehicle_id') as string), route_id: parseInt(fd.get('route_id') as string) || undefined })); flash('Assigned'); }} className="space-y-4">
        <div className="form-row"><div className="form-group"><label>Driver *</label><select name="driver_id" required><option value="">Select</option>{drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}</select></div><div className="form-group"><label>Vehicle *</label><select name="vehicle_id" required><option value="">Select</option>{vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div></div>
        <button type="submit" className="btn btn-primary">Assign Transport</button>
      </form></Card>))}</>);
  }

  if (role === 'quality-assurance' && pageKey === 'damaged-items') {
    return shell(<Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => reportDamagedItem(d, user, parseInt(fd.get('shipment_id') as string), fd.get('notes') as string)); flash('Report filed'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Shipment *</label><select name="shipment_id" required>{data.shipments.map((s) => <option key={s.id} value={s.id}>{s.tracking_number}</option>)}</select></div>
      <div className="form-group"><label>Damage *</label><textarea name="notes" required rows={3} /></div><button type="submit" className="btn btn-primary">Report Damage</button>
    </form></Card>);
  }

  if (role === 'quality-assurance' && pageKey === 'compliance') {
    return shell(<Card><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createComplianceRecord(d, user, fd.get('title') as string, fd.get('notes') as string)); flash('Record added'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Title *</label><input name="title" required /></div><div className="form-group"><label>Findings *</label><textarea name="notes" required rows={3} /></div><button type="submit" className="btn btn-primary">Add Record</button>
    </form></Card>);
  }

  if (role === 'finance-officer' && pageKey === 'payments') {
    return shell(<Card><CardHeader title="Payments" /><DataTable headers={['Invoice', 'Amount', 'Status', 'Action']} rows={data.invoices.map((i) => [i.invoice_number, formatCurrency(i.amount), <StatusBadge key={i.id} status={i.status} />, i.status === 'pending' ? <button key={i.id} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => recordPayment(d, user, i.id, i.amount)); flash('Paid'); }}>Pay</button> : '—'])} /></Card>);
  }

  if (role === 'security-officer' && pageKey === 'users-access') {
    return shell(<Card><CardHeader title="Access Controls" /><DataTable headers={['User', 'Role', 'Status', 'Action']} rows={data.users.filter((u) => u.id !== user.id).slice(0, 15).map((u) => [u.full_name, getRoleLabel(u.role), <StatusBadge key={u.id} status={u.status} />, u.status === 'active' ? <button key={`s-${u.id}`} type="button" className="btn btn-sm btn-outline text-red-600" onClick={() => { update((d) => updateUserAccess(d, user, u.id, 'suspended')); flash('Suspended'); }}>Suspend</button> : <button key={`a-${u.id}`} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateUserAccess(d, user, u.id, 'active')); flash('Restored'); }}>Restore</button>])} /></Card>);
  }

  if (role === 'shipment-coordinator' && pageKey === 'coordinate') {
    const active = data.shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status));
    return shell(<>{active.slice(0, 6).map((s) => (<Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => coordinateShipment(d, user, s.id, fd.get('notes') as string)); flash('Updated'); e.currentTarget.reset(); }} className="space-y-3"><textarea name="notes" required rows={2} className="w-full rounded-xl border border-candy-200 p-3 text-sm" placeholder="Coordination notes..." /><button type="submit" className="btn btn-primary btn-sm">Save</button></form></Card>))}</>);
  }

  if (role === 'loading-unloading-staff' && pageKey === 'cargo-status') {
    return shell(<>{data.shipments.filter((s) => ['packed', 'loaded', 'in_transit'].includes(s.status)).slice(0, 8).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} /><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => updateCargoStatus(d, user, s.id, fd.get('status') as string, fd.get('notes') as string)); flash('Updated'); }} className="space-y-3">
        <input name="status" required placeholder="Status" className="w-full rounded-xl border border-candy-200 p-2.5 text-sm" /><textarea name="notes" rows={2} className="w-full rounded-xl border border-candy-200 p-2.5 text-sm" /><button type="submit" className="btn btn-primary btn-sm">Update Cargo</button>
      </form></Card>))}</>);
  }

  if (role === 'maintenance-technician' && pageKey === 'repairs') {
    return shell(<>{data.vehicleMaintenance.filter((j) => j.status !== 'completed').map((j) => (
      <Card key={j.id} className="mb-4"><CardHeader title={j.type} /><form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => updateRepairLog(d, user, j.id, fd.get('desc') as string, parseFloat(fd.get('cost') as string))); flash('Log updated'); }} className="space-y-3">
        <textarea name="desc" required rows={2} defaultValue={j.description} className="w-full rounded-xl border border-candy-200 p-2.5 text-sm" /><input name="cost" type="number" defaultValue={j.cost} required className="w-full rounded-xl border border-candy-200 p-2.5 text-sm" /><button type="submit" className="btn btn-primary btn-sm">Update Log</button>
      </form></Card>))}</>);
  }

  if (role === 'procurement-officer' && pageKey === 'purchases') {
    return shell(<Card><CardHeader title="Purchase Orders" /><DataTable headers={['PO', 'Supplier', 'Amount', 'Status', 'Delete']} rows={data.purchaseOrders.map((p) => [p.po_number, getUserById(data, p.supplier_id)?.full_name ?? '—', formatCurrency(p.total_amount), <StatusBadge key={p.id} status={p.status} />, p.status === 'draft' ? <button key={p.id} type="button" className="btn btn-sm btn-outline text-red-600" onClick={() => { update((d) => deletePurchaseOrder(d, user, p.id)); flash('Deleted'); }}>Delete</button> : '—'])} /></Card>);
  }

  if (role === 'route-planner' && pageKey === 'optimize') {
    return shell(<Card><CardHeader title="Routes" /><DataTable headers={['Route', 'Km', 'Status', 'Activate']} rows={data.deliveryRoutes.map((r) => [r.route_name, r.distance_km, <StatusBadge key={r.id} status={r.status} />, r.status === 'planned' ? <button key={r.id} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateRoute(d, user, r.id, { status: 'active' })); flash('Activated'); }}>Go</button> : '—'])} /></Card>);
  }

  // ─── LOGISTICS MANAGER: Monitor shipments ───
  if (role === 'logistics-manager' && pageKey === 'shipments') {
    const active = data.shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status));
    return shell(<>{active.slice(0, 8).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} />
        <p className="mb-3 text-sm text-candy-600">{s.origin} → {s.destination}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => updateShipmentPriority(d, user, s.id, fd.get('priority') as 'normal' | 'high' | 'urgent', fd.get('notes') as string)); flash('Shipment updated'); }} className="space-y-3">
          <div className="form-row"><div className="form-group"><label>Priority</label><select name="priority" defaultValue={s.priority}><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div>
          <div className="form-group"><label>Notes</label><textarea name="notes" rows={2} placeholder="Operational note..." /></div>
          <button type="submit" className="btn btn-primary btn-sm">Update Shipment</button>
        </form>
      </Card>))}{active.length === 0 && <Card><EmptyState message="No active shipments" /></Card>}</>);
  }

  // ─── DISPATCHER: Schedule / Monitor / Routes ───
  if (role === 'dispatcher' && pageKey === 'schedule') {
    const assignments = data.deliveryAssignments.filter((a) => !['delivered', 'failed'].includes(a.status));
    return shell(<>{assignments.length === 0 ? <Card><EmptyState message="No deliveries to schedule" /></Card> : assignments.map((a) => {
      const s = data.shipments.find((x) => x.id === a.shipment_id);
      return (<Card key={a.id} className="mb-4"><CardHeader title={s?.tracking_number ?? 'Delivery'} action={<StatusBadge status={a.status} />} />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => scheduleDispatch(d, user, a.id, fd.get('date') as string, fd.get('notes') as string)); flash('Scheduled'); }} className="space-y-3">
          <div className="form-row"><div className="form-group"><label>Delivery Date *</label><input name="date" type="date" required /></div></div>
          <div className="form-group"><label>Schedule Notes</label><textarea name="notes" rows={2} /></div>
          <button type="submit" className="btn btn-primary btn-sm">Save Schedule</button>
        </form>
      </Card>);
    })}</>);
  }

  if (role === 'dispatcher' && pageKey === 'monitor') {
    const active = data.deliveryAssignments.filter((a) => !['delivered', 'failed'].includes(a.status));
    return shell(<Card><CardHeader title="Active Deliveries" /><DataTable headers={['Tracking', 'Driver', 'Status', 'Update']} rows={active.map((a) => {
      const s = data.shipments.find((x) => x.id === a.shipment_id);
      const driver = getUserById(data, a.driver_id);
      return [s?.tracking_number ?? '—', driver?.full_name ?? '—', <StatusBadge key={a.id} status={a.status} />, <div key={`u-${a.id}`} className="flex flex-wrap gap-1"><button type="button" className="btn btn-sm btn-outline" onClick={() => { update((d) => updateDispatchStatus(d, user, a.id, 'in_transit')); flash('In transit'); }}>Transit</button><button type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateDispatchStatus(d, user, a.id, 'delivered')); flash('Delivered'); }}>Delivered</button></div>];
    })} /></Card>);
  }

  if (role === 'dispatcher' && pageKey === 'routes') {
    const unlinked = data.shipments.filter((s) => !s.route_id && !['delivered', 'cancelled'].includes(s.status));
    return shell(<>{unlinked.length === 0 ? <Card><EmptyState message="All shipments have routes" /></Card> : unlinked.slice(0, 6).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => linkRouteToShipment(d, user, s.id, parseInt(fd.get('route_id') as string))); flash('Route linked'); }} className="space-y-3">
          <div className="form-group"><label>Assign Route *</label><select name="route_id" required><option value="">Select route</option>{data.deliveryRoutes.filter((r) => r.status === 'active' || r.status === 'planned').map((r) => <option key={r.id} value={r.id}>{r.route_name} ({r.distance_km} km)</option>)}</select></div>
          <button type="submit" className="btn btn-primary btn-sm">Link Route</button>
        </form>
      </Card>))}</>);
  }

  // ─── DRIVER: Update status ───
  if (role === 'driver' && pageKey === 'update-status') {
    const mine = data.deliveryAssignments.filter((a) => a.driver_id === user.id && a.status !== 'delivered');
    return shell(<>{mine.length === 0 ? <Card><EmptyState message="No active assignments" /></Card> : mine.map((a) => {
      const s = data.shipments.find((x) => x.id === a.shipment_id);
      return (<Card key={a.id} className="mb-4"><CardHeader title={s?.tracking_number ?? 'Delivery'} action={<StatusBadge status={a.status} />} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline" onClick={() => { update((d) => { recordDeliveryEvent(d, user, a.id, 'progress', 'Out for delivery'); }); flash('Status updated'); }}>Out for Delivery</button>
          <button type="button" className="btn btn-primary" onClick={() => { update((d) => updateDispatchStatus(d, user, a.id, 'in_transit')); flash('In transit'); }}>In Transit</button>
          <button type="button" className="btn btn-primary" onClick={() => { update((d) => updateDispatchStatus(d, user, a.id, 'delivered')); flash('Delivered'); }}>Mark Delivered</button>
        </div>
      </Card>);
    })}</>);
  }

  // ─── FLEET: Maintenance monitor ───
  if (role === 'fleet-manager' && pageKey === 'maintenance') {
    const jobs = data.vehicleMaintenance.filter((j) => j.status !== 'completed');
    return shell(<Card><CardHeader title="Maintenance Jobs" /><DataTable headers={['Vehicle', 'Type', 'Status', 'Action']} rows={jobs.map((j) => {
      const v = data.vehicles.find((x) => x.id === j.vehicle_id);
      return [v?.plate_number ?? '—', j.type, <StatusBadge key={j.id} status={j.status} />, j.status !== 'completed' ? <button key={j.id} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => completeMaintenanceJob(d, user, j.id)); flash('Completed'); }}>Complete</button> : '—'];
    })} /></Card>);
  }

  // ─── WAREHOUSE / INVENTORY: Stock levels ───
  if (role === 'warehouse-manager' && pageKey === 'inventory') {
    const low = data.inventoryItems.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock');
    return shell(<>{low.length === 0 ? <Card><EmptyState message="All stock levels OK" /></Card> : low.map((i) => (
      <Card key={i.id} className="mb-4"><CardHeader title={i.name} action={<StatusBadge status={i.status} />} />
        <p className="mb-3 text-sm">SKU: {i.sku} · Qty: {i.quantity} · Min: {i.min_quantity}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => restockItem(d, user, i.id, parseInt(fd.get('qty') as string))); flash('Restocked'); }} className="flex flex-wrap items-end gap-3">
          <div className="form-group flex-1"><label>Restock Qty</label><input name="qty" type="number" min={1} required defaultValue={i.min_quantity * 2} /></div>
          <button type="submit" className="btn btn-primary btn-sm">Restock</button>
        </form>
      </Card>))}</>);
  }

  if (role === 'inventory-controller' && pageKey === 'stock') {
    return shell(<Card glow><CardHeader title="Restock Inventory" /><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => restockItem(d, user, parseInt(fd.get('item_id') as string), parseInt(fd.get('qty') as string))); flash('Stock updated'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>Item *</label><select name="item_id" required>{data.inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.quantity} in stock)</option>)}</select></div><div className="form-group"><label>Qty to Add *</label><input name="qty" type="number" min={1} required /></div></div>
      <button type="submit" className="btn btn-primary">Add Stock</button>
    </form></Card>);
  }

  // ─── PROCUREMENT: Incoming goods / vendors ───
  if (role === 'procurement-officer' && pageKey === 'incoming') {
    const incoming = data.purchaseOrders.filter((p) => ['shipped', 'confirmed'].includes(p.status));
    return shell(<>{incoming.length === 0 ? <Card><EmptyState message="No incoming goods" /></Card> : incoming.map((p) => (
      <Card key={p.id} className="mb-4"><CardHeader title={p.po_number} action={<StatusBadge status={p.status} />} />
        <p className="mb-3">{formatCurrency(p.total_amount)} · Supplier: {getUserById(data, p.supplier_id)?.full_name ?? '—'}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => markPOReceived(d, user, p.id, fd.get('notes') as string)); flash('Marked received'); }} className="space-y-3">
          <div className="form-group"><label>Receipt Notes</label><textarea name="notes" rows={2} placeholder="Condition, quantity verified..." /></div>
          <button type="submit" className="btn btn-primary btn-sm">Mark Received</button>
        </form>
      </Card>))}</>);
  }

  if (role === 'procurement-officer' && pageKey === 'vendors') {
    const suppliers = getUsersByRole(data, 'supplier-vendor');
    return shell(<Card><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => logVendorCoordination(d, user, parseInt(fd.get('supplier_id') as string), fd.get('message') as string)); flash('Message logged'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Vendor *</label><select name="supplier_id" required><option value="">Select</option>{suppliers.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}</select></div>
      <div className="form-group"><label>Message *</label><textarea name="message" required rows={3} placeholder="Coordination notes for vendor..." /></div>
      <button type="submit" className="btn btn-primary">Log Coordination</button>
    </form></Card>);
  }

  // ─── SUPPLIER: Purchase orders view + actions ───
  if (role === 'supplier-vendor' && pageKey === 'purchase-orders') {
    const pos = data.purchaseOrders.filter((p) => p.supplier_id === user.id);
    return shell(<>{pos.map((p) => (
      <Card key={p.id} className="mb-4"><CardHeader title={p.po_number} action={<StatusBadge status={p.status} />} />
        <p className="mb-3">{formatCurrency(p.total_amount)}</p>
        <div className="flex flex-wrap gap-2">
          {p.status === 'sent' && <button type="button" className="btn btn-primary btn-sm" onClick={() => { update((d) => confirmPO(d, user, p.id, 'confirm')); flash('Confirmed'); }}>Confirm PO</button>}
          {p.status === 'confirmed' && <button type="button" className="btn btn-primary btn-sm" onClick={() => { update((d) => confirmPO(d, user, p.id, 'ship')); flash('Marked shipped'); }}>Mark Shipped</button>}
        </div>
      </Card>))}{pos.length === 0 && <Card><EmptyState message="No purchase orders" /></Card>}</>);
  }

  // ─── CUSTOMER: History + raise ticket ───
  if (role === 'customer' && pageKey === 'history') {
    const mine = data.shipments.filter((s) => s.customer_id === user.id && ['delivered', 'cancelled', 'issue'].includes(s.status));
    return shell(<>{mine.slice(0, 10).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} />
        <p className="mb-3 text-sm">{s.origin} → {s.destination}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createTicketFromShipment(d, user, s.id, fd.get('subject') as string, fd.get('description') as string)); flash('Support ticket created'); e.currentTarget.reset(); }} className="space-y-3">
          <div className="form-group"><label>Issue Subject</label><input name="subject" required placeholder="Delivery issue..." /></div>
          <div className="form-group"><label>Description</label><textarea name="description" required rows={2} /></div>
          <button type="submit" className="btn btn-outline btn-sm">Raise Support Ticket</button>
        </form>
      </Card>))}{mine.length === 0 && <Card><EmptyState message="No delivery history yet" /></Card>}</>);
  }

  // ─── TRANSPORT COORDINATOR: Monitor ───
  if (role === 'transport-coordinator' && pageKey === 'monitor') {
    const active = data.deliveryAssignments.filter((a) => !['delivered', 'failed'].includes(a.status));
    return shell(<Card><CardHeader title="Shipment Movements" /><DataTable headers={['Tracking', 'Driver', 'Vehicle', 'Status', 'Update']} rows={active.map((a) => {
      const s = data.shipments.find((x) => x.id === a.shipment_id);
      const driver = getUserById(data, a.driver_id);
      const vehicle = data.vehicles.find((v) => v.id === a.vehicle_id);
      return [s?.tracking_number ?? '—', driver?.full_name ?? '—', vehicle?.plate_number ?? '—', <StatusBadge key={a.id} status={a.status} />, <button key={`b-${a.id}`} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateDispatchStatus(d, user, a.id, 'in_transit')); flash('Updated'); }}>Mark In Transit</button>];
    })} /></Card>);
  }

  if (role === 'transport-coordinator' && pageKey === 'coordinate') {
    const pending = data.shipments.filter((s) => ['loaded', 'dispatched'].includes(s.status));
    return shell(<>{pending.slice(0, 6).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => coordinateShipment(d, user, s.id, fd.get('notes') as string)); flash('Coordination saved'); e.currentTarget.reset(); }} className="space-y-3">
          <textarea name="notes" required rows={2} className="w-full rounded-xl border border-candy-200 p-3 text-sm" placeholder="Transport coordination notes..." />
          <button type="submit" className="btn btn-primary btn-sm">Save Coordination</button>
        </form>
      </Card>))}{pending.length === 0 && <Card><EmptyState message="No shipments to coordinate" /></Card>}</>);
  }

  // ─── FINANCE: Logistics costs ───
  if (role === 'finance-officer' && pageKey === 'costs') {
    return shell(<Card glow><CardHeader title="Log Logistics Cost" /><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => logLogisticsCost(d, user, fd.get('category') as string, parseFloat(fd.get('amount') as string), fd.get('notes') as string)); flash('Cost logged'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>Category *</label><select name="category" required><option value="fuel">Fuel</option><option value="maintenance">Maintenance</option><option value="warehouse">Warehouse</option><option value="transport">Transport</option><option value="other">Other</option></select></div><div className="form-group"><label>Amount (₱) *</label><input name="amount" type="number" min={1} required /></div></div>
      <div className="form-group"><label>Notes *</label><textarea name="notes" required rows={2} /></div>
      <button type="submit" className="btn btn-primary">Log Cost</button>
    </form></Card>);
  }

  // ─── AUDITOR ───
  if (role === 'auditor' && pageKey === 'transactions') {
    const logs = data.auditLogs.slice(0, 15);
    return shell(<Card><CardHeader title="Review Transactions" /><DataTable headers={['User', 'Action', 'Details', 'Flag']} rows={logs.map((a) => [
      getUserById(data, a.user_id ?? 0)?.full_name ?? 'System', a.action, a.details ?? '—',
      <button key={a.id} type="button" className="btn btn-sm btn-outline" onClick={() => { const notes = prompt('Flag notes:'); if (notes) { update((d) => flagAuditItem(d, user, a.id, notes)); flash('Flagged'); } }}>Flag</button>,
    ])} /></Card>);
  }

  if (role === 'auditor' && pageKey === 'compliance') {
    return shell(<Card><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => recordComplianceFinding(d, user, fd.get('title') as string, fd.get('notes') as string)); flash('Finding recorded'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Finding Title *</label><input name="title" required /></div>
      <div className="form-group"><label>Details *</label><textarea name="notes" required rows={3} /></div>
      <button type="submit" className="btn btn-primary">Record Finding</button>
    </form></Card>);
  }

  // ─── DATA ANALYST: Export snapshot on analytics pages ───
  if (role === 'data-analyst' && ['performance', 'dashboard', 'kpis', 'trends'].includes(pageKey)) {
    return shell(<Card><CardHeader title="Analytics Actions" /><p className="mb-4 text-candy-600">Export a snapshot of current logistics data for reporting.</p>
      <button type="button" className="btn btn-primary" onClick={() => { update((d) => exportAnalyticsSnapshot(d, user, `${pageKey}-report`)); flash('Report snapshot logged'); }}>Generate Report Snapshot</button>
    </Card>);
  }

  // ─── SECURITY ───
  if (role === 'security-officer' && pageKey === 'security') {
    return shell(<Card><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => logSecurityReview(d, user, fd.get('email') as string, fd.get('action') as string, fd.get('notes') as string)); flash('Security review logged'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>User Email *</label><input name="email" type="email" required /></div><div className="form-group"><label>Action *</label><select name="action" required><option value="review">Review</option><option value="investigate">Investigate</option><option value="clear">Clear</option></select></div></div>
      <div className="form-group"><label>Notes *</label><textarea name="notes" required rows={2} /></div>
      <button type="submit" className="btn btn-primary">Log Review</button>
    </form></Card>);
  }

  if (role === 'security-officer' && pageKey === 'access-logs') {
    const suspicious = data.accessLogs.slice(0, 20);
    return shell(<Card><CardHeader title="Access Log Review" /><DataTable headers={['Email', 'Action', 'Date', 'Review']} rows={suspicious.map((a) => [
      a.email, a.action, formatDateTime(a.created_at),
      <button key={a.id} type="button" className="btn btn-sm btn-outline" onClick={() => { update((d) => logSecurityReview(d, user, a.email, 'review', `Reviewed log #${a.id}`)); flash('Review logged'); }}>Review</button>,
    ])} /></Card>);
  }

  // ─── MAINTENANCE: Records ───
  if (role === 'maintenance-technician' && pageKey === 'records') {
    return shell(<Card glow><CardHeader title="Add Maintenance Record" /><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => addMaintenanceRecord(d, user, parseInt(fd.get('vehicle_id') as string), fd.get('type') as string, fd.get('notes') as string)); flash('Record added'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-row"><div className="form-group"><label>Vehicle *</label><select name="vehicle_id" required>{data.vehicles.map((v) => <option key={v.id} value={v.id}>{v.plate_number}</option>)}</select></div><div className="form-group"><label>Type *</label><input name="type" required placeholder="Oil change, brake check..." /></div></div>
      <div className="form-group"><label>Notes *</label><textarea name="notes" required rows={2} /></div>
      <button type="submit" className="btn btn-primary">Add Record</button>
    </form></Card>);
  }

  // ─── BRANCH MANAGER ───
  if (role === 'branch-manager' && pageKey === 'staff') {
    const branchId = user.branch_id;
    const staff = data.users.filter((u) => u.branch_id === branchId && u.id !== user.id);
    return shell(<><Card><form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => assignBranchTask(d, user, fd.get('title') as string, parseInt(fd.get('assign_to') as string))); flash('Task assigned'); e.currentTarget.reset(); }} className="space-y-4">
      <div className="form-group"><label>Task Title *</label><input name="title" required /></div>
      <div className="form-group"><label>Assign To *</label><select name="assign_to" required><option value="">Select staff</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.full_name} ({getRoleLabel(s.role)})</option>)}</select></div>
      <button type="submit" className="btn btn-primary">Assign Branch Task</button>
    </form></Card><Card className="mt-4"><CardHeader title="Branch Staff" /><DataTable headers={['Name', 'Role', 'Status']} rows={staff.map((u) => [u.full_name, getRoleLabel(u.role), <StatusBadge key={u.id} status={u.status} />])} /></Card></>);
  }

  if (role === 'branch-manager' && pageKey === 'warehouse') {
    const branchId = user.branch_id;
    const items = branchId ? data.inventoryItems.filter((i) => i.branch_id === branchId) : data.inventoryItems;
    return shell(<>{items.slice(0, 8).map((i) => (
      <Card key={i.id} className="mb-4"><CardHeader title={i.name} action={<StatusBadge status={i.status} />} />
        <p className="mb-3 text-sm">Qty: {i.quantity} · Min: {i.min_quantity}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => adjustBranchInventory(d, user, i.id, parseInt(fd.get('min_qty') as string))); flash('Min qty updated'); }} className="flex flex-wrap items-end gap-3">
          <div className="form-group flex-1"><label>Min Quantity</label><input name="min_qty" type="number" min={0} defaultValue={i.min_quantity} required /></div>
          <button type="submit" className="btn btn-primary btn-sm">Update</button>
        </form>
      </Card>))}</>);
  }

  if (role === 'branch-manager' && pageKey === 'branch-ops') {
    const branchId = user.branch_id;
    const shipments = branchId ? data.shipments.filter((s) => s.branch_id === branchId && !['delivered', 'cancelled'].includes(s.status)) : data.shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status));
    return shell(<>{shipments.slice(0, 6).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => addShipmentTrackingNote(d, user, s.id, fd.get('notes') as string)); flash('Note added'); e.currentTarget.reset(); }} className="space-y-3">
          <textarea name="notes" required rows={2} className="w-full rounded-xl border border-candy-200 p-3 text-sm" placeholder="Branch operations note..." />
          <button type="submit" className="btn btn-primary btn-sm">Add Ops Note</button>
        </form>
      </Card>))}{shipments.length === 0 && <Card><EmptyState message="No active branch shipments" /></Card>}</>);
  }

  // ─── SHIPMENT COORDINATOR: Track ───
  if (role === 'shipment-coordinator' && pageKey === 'track') {
    const active = data.shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status));
    return shell(<>{active.slice(0, 8).map((s) => (
      <Card key={s.id} className="mb-4"><CardHeader title={s.tracking_number} action={<StatusBadge status={s.status} />} />
        <p className="mb-2 text-sm text-candy-600">{s.origin} → {s.destination}</p>
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => addShipmentTrackingNote(d, user, s.id, fd.get('notes') as string)); flash('Progress updated'); e.currentTarget.reset(); }} className="space-y-3">
          <textarea name="notes" required rows={2} className="w-full rounded-xl border border-candy-200 p-3 text-sm" placeholder="Tracking update..." />
          <button type="submit" className="btn btn-primary btn-sm">Update Progress</button>
        </form>
      </Card>))}</>);
  }

  // ─── PACKING STAFF: Records ───
  if (role === 'packing-staff' && pageKey === 'records') {
    const records = data.packingRecords.slice(0, 10);
    return shell(<>{records.map((r) => {
      const s = data.shipments.find((x) => x.id === r.shipment_id);
      return (<Card key={r.id} className="mb-4"><CardHeader title={s?.tracking_number ?? 'Shipment'} action={r.verified ? <span className="text-green-600 text-sm font-bold">Verified</span> : <span className="text-amber-600 text-sm font-bold">Pending</span>} />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => addPackingNote(d, user, r.id, fd.get('notes') as string)); flash('Note saved'); e.currentTarget.reset(); }} className="space-y-3">
          <textarea name="notes" required rows={2} className="w-full rounded-xl border border-candy-200 p-3 text-sm" placeholder="Packing record notes..." />
          <button type="submit" className="btn btn-primary btn-sm">Update Record</button>
        </form>
      </Card>);
    })}{records.length === 0 && <Card><EmptyState message="No packing records" /></Card>}</>);
  }

  // ─── ROUTE PLANNER: Schedules ───
  if (role === 'route-planner' && pageKey === 'schedules') {
    const routes = data.deliveryRoutes.filter((r) => r.status === 'active' || r.status === 'planned');
    return shell(<Card><CardHeader title="Assign Delivery Schedules" /><DataTable headers={['Route', 'Distance', 'Status', 'Complete']} rows={routes.map((r) => [
      r.route_name, `${r.distance_km} km`, <StatusBadge key={r.id} status={r.status} />,
      r.status === 'active' ? <button key={r.id} type="button" className="btn btn-sm btn-primary" onClick={() => { update((d) => updateRoute(d, user, r.id, { status: 'completed' })); flash('Route completed'); }}>Complete</button> : '—',
    ])} /></Card>);
  }

  // ─── CUSTOMER SERVICE: Inquiries (create ticket + list) ───
  if (role === 'customer-service' && pageKey === 'inquiries') {
    const customers = getUsersByRole(data, 'customer');
    const open = data.supportTickets.filter((t) => ['open', 'in_progress'].includes(t.status));
    return shell(<>
      <Card glow><CardHeader title="Create Ticket for Customer" />
        <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); update((d) => createCustomerTicket(d, user, parseInt(fd.get('customer_id') as string), fd.get('subject') as string, fd.get('description') as string)); flash('Ticket created'); e.currentTarget.reset(); }} className="space-y-4">
          <div className="form-group"><label>Customer *</label><select name="customer_id" required><option value="">Select</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></div>
          <div className="form-group"><label>Subject *</label><input name="subject" required /></div>
          <div className="form-group"><label>Description *</label><textarea name="description" required rows={3} /></div>
          <button type="submit" className="btn btn-primary">Create Ticket</button>
        </form>
      </Card>
      {open.map((t) => (
        <Card key={t.id} className="mb-4 mt-4"><CardHeader title={t.ticket_number} action={<StatusBadge status={t.status} />} />
          <p className="mb-2 font-bold">{t.subject}</p><p className="mb-4 text-candy-600">{t.description}</p>
          <div className="flex flex-wrap gap-2">
            {t.status === 'open' && <button type="button" className="btn btn-outline" onClick={() => { update((d) => takeTicket(d, user, t.id)); flash('Ticket taken'); }}>Take Ticket</button>}
            {t.status !== 'resolved' && <button type="button" className="btn btn-primary" onClick={() => { update((d) => resolveTicket(d, user, t.id)); flash('Resolved'); }}>Resolve</button>}
          </div>
        </Card>
      ))}{open.length === 0 && <Card className="mt-4"><EmptyState message="No open tickets" /></Card>}
    </>);
  }

  return null;
}
