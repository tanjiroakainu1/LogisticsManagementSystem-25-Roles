import type { AppData, AuthUser, Priority, RoleKey, ShipmentStatus, UserStatus } from '@/types';
import { logCrud } from '@/lib/crudLog';
import {
  generateInvoiceNumber,
  generatePONumber,
  generateTicketNumber,
  generateTrackingNumber,
  nextId,
} from './store';

function ts(): string {
  return new Date().toISOString();
}

export function auditLog(
  data: AppData,
  userId: number | null,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: string
): void {
  data.auditLogs.unshift({
    id: nextId(data, 'auditLogs'),
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    created_at: ts(),
  });
}

export function logAccess(data: AppData, userId: number | null, email: string, action: string): void {
  data.accessLogs.unshift({
    id: nextId(data, 'accessLogs'),
    user_id: userId,
    email,
    action,
    created_at: ts(),
  });
}

export function notifyUser(
  data: AppData,
  userId: number,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
): void {
  data.notifications.unshift({
    id: nextId(data, 'notifications'),
    user_id: userId,
    title,
    message,
    type,
    link,
    is_read: false,
    created_at: ts(),
  });
}

export function notifyRole(
  data: AppData,
  role: RoleKey,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  link?: string
): void {
  data.users.filter((u) => u.role === role && u.status === 'active').forEach((u) => {
    notifyUser(data, u.id, title, message, type, link);
  });
}

export function logShipmentStatus(
  data: AppData,
  shipmentId: number,
  status: string,
  userId: number,
  notes?: string
): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  if (shipment) {
    shipment.status = status as ShipmentStatus;
    shipment.updated_at = ts();
  }
  data.shipmentStatusLogs.unshift({
    id: nextId(data, 'shipmentStatusLogs'),
    shipment_id: shipmentId,
    status,
    notes,
    updated_by: userId,
    created_at: ts(),
  });
}

export function createShipment(
  data: AppData,
  user: AuthUser,
  payload: { origin: string; destination: string; description?: string; weight_kg: number; priority: Priority; estimated_delivery?: string }
): string {
  const tracking = generateTrackingNumber();
  const id = nextId(data, 'shipments');
  data.shipments.unshift({
    id,
    tracking_number: tracking,
    customer_id: user.id,
    origin: payload.origin,
    destination: payload.destination,
    description: payload.description,
    weight_kg: payload.weight_kg,
    status: 'pending',
    priority: payload.priority,
    branch_id: user.branch_id,
    coordinator_id: null,
    route_id: null,
    estimated_delivery: payload.estimated_delivery || null,
    delivered_at: null,
    created_at: ts(),
    updated_at: ts(),
  });
  logShipmentStatus(data, id, 'pending', user.id, 'Shipment request created by customer');
  logCrud(data, user, 'create', 'shipment', id, tracking, `${payload.origin} → ${payload.destination}`);
  notifyRole(data, 'shipment-coordinator', 'New Shipment Request', `Shipment ${tracking} needs processing`, 'info');
  notifyRole(data, 'customer-service', 'New Shipment Created', `Customer created shipment ${tracking}`, 'info');
  return tracking;
}

export function processShipment(data: AppData, user: AuthUser, shipmentId: number, action: 'approve' | 'process' | 'issue'): void {
  const map = { approve: 'approved', process: 'processing', issue: 'issue' } as const;
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  logShipmentStatus(data, shipmentId, map[action], user.id, `Shipment ${action}d by coordinator`);
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, `Status → ${map[action]}`);
  if (action === 'approve') notifyRole(data, 'packing-staff', 'Ready to Pack', 'New shipment approved for packing', 'info');
}

export function packShipment(data: AppData, user: AuthUser, shipmentId: number): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  const recordId = nextId(data, 'packingRecords');
  data.packingRecords.unshift({ id: recordId, shipment_id: shipmentId, packer_id: user.id, verified: false, packed_at: ts() });
  logShipmentStatus(data, shipmentId, 'packed', user.id, 'Packed by staff');
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, 'Marked as packed');
  notifyRole(data, 'quality-assurance', 'Inspection Required', 'Packed shipment needs QA', 'info');
}

export function inspectShipment(data: AppData, user: AuthUser, shipmentId: number, result: 'passed' | 'failed' | 'conditional', damage?: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.qualityInspections.unshift({
    id: nextId(data, 'qualityInspections'),
    shipment_id: shipmentId,
    inspector_id: user.id,
    result,
    damage_report: damage,
    inspected_at: ts(),
  });
  if (result === 'passed') {
    logShipmentStatus(data, shipmentId, 'loaded', user.id, 'QA passed');
    notifyRole(data, 'loading-unloading-staff', 'Ready to Load', 'Shipment passed QA', 'info');
  } else {
    logShipmentStatus(data, shipmentId, 'issue', user.id, 'QA failed: ' + (damage || ''));
  }
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, `QA ${result}`);
}

export function loadShipment(data: AppData, user: AuthUser, shipmentId: number): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.loadingRecords.unshift({ id: nextId(data, 'loadingRecords'), shipment_id: shipmentId, staff_id: user.id, action_type: 'load', condition_status: 'good', recorded_at: ts() });
  logShipmentStatus(data, shipmentId, 'loaded', user.id, 'Cargo loaded');
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, 'Cargo loaded');
  notifyRole(data, 'dispatcher', 'Ready for Dispatch', 'Shipment loaded and ready', 'info');
}

export function assignDelivery(
  data: AppData,
  user: AuthUser,
  payload: { shipment_id: number; driver_id: number; vehicle_id?: number; route_id?: number }
): void {
  const shipment = data.shipments.find((s) => s.id === payload.shipment_id);
  if (!shipment) return;
  const assignmentId = nextId(data, 'deliveryAssignments');
  data.deliveryAssignments.unshift({
    id: assignmentId,
    shipment_id: payload.shipment_id,
    driver_id: payload.driver_id,
    vehicle_id: payload.vehicle_id || null,
    dispatcher_id: user.id,
    route_id: payload.route_id || null,
    status: 'assigned',
    assigned_at: ts(),
  });
  logShipmentStatus(data, payload.shipment_id, 'dispatched', user.id, 'Assigned to driver');
  if (payload.vehicle_id) {
    const v = data.vehicles.find((x) => x.id === payload.vehicle_id);
    if (v) { v.status = 'in_use'; v.assigned_driver_id = payload.driver_id; }
  }
  if (payload.route_id) shipment.route_id = payload.route_id;
  logCrud(data, user, 'create', 'delivery_assignment', assignmentId, shipment.tracking_number, `Driver #${payload.driver_id} assigned`);
  notifyUser(data, payload.driver_id, 'New Delivery Assignment', `Assigned shipment ${shipment.tracking_number}`, 'info');
  notifyUser(data, shipment.customer_id, 'Shipment Dispatched', `Your shipment ${shipment.tracking_number} is on its way!`, 'success');
  notifyRole(data, 'transport-coordinator', 'New Dispatch', `Shipment ${shipment.tracking_number} dispatched`, 'info');
}

export function updateDeliveryStatus(data: AppData, user: AuthUser, assignmentId: number, status: 'in_transit' | 'delivered'): void {
  const a = data.deliveryAssignments.find((x) => x.id === assignmentId);
  if (!a) return;
  a.status = status;
  const shipment = data.shipments.find((s) => s.id === a.shipment_id);
  if (shipment) {
    logShipmentStatus(data, shipment.id, status === 'delivered' ? 'delivered' : 'in_transit', user.id, 'Driver updated status');
    if (status === 'delivered') {
      shipment.delivered_at = ts();
      notifyUser(data, shipment.customer_id, 'Delivered!', `Shipment ${shipment.tracking_number} delivered`, 'success');
      notifyRole(data, 'finance-officer', 'Create Invoice', `Shipment ${shipment.tracking_number} delivered`, 'info');
    }
    logCrud(data, user, 'update', 'delivery_assignment', assignmentId, shipment.tracking_number, `Status → ${status}`);
  }
}

export function createPurchaseOrder(data: AppData, user: AuthUser, supplierId: number, amount: number): void {
  const po = generatePONumber(data);
  const id = nextId(data, 'purchaseOrders');
  data.purchaseOrders.unshift({
    id,
    po_number: po,
    procurement_officer_id: user.id,
    supplier_id: supplierId,
    total_amount: amount,
    status: 'sent',
    expected_delivery: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'purchase_order', id, po, formatCurrency(amount));
  notifyUser(data, supplierId, 'New Purchase Order', `PO ${po} awaiting confirmation`, 'info');
}

function formatCurrency(n: number): string {
  return '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

export function confirmPO(data: AppData, user: AuthUser, poId: number, action: 'confirm' | 'ship'): void {
  const po = data.purchaseOrders.find((p) => p.id === poId && p.supplier_id === user.id);
  if (!po) return;
  po.status = action === 'confirm' ? 'confirmed' : 'shipped';
  logCrud(data, user, 'update', 'purchase_order', poId, po.po_number, `Status → ${po.status}`);
  notifyUser(data, po.procurement_officer_id, 'PO Updated', `PO ${po.po_number} ${po.status}`, 'info');
}

export function createInvoice(data: AppData, user: AuthUser, shipmentId: number, amount: number): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return;
  const invNum = generateInvoiceNumber(data);
  const id = nextId(data, 'invoices');
  data.invoices.unshift({
    id,
    invoice_number: invNum,
    shipment_id: shipmentId,
    customer_id: shipment.customer_id,
    amount,
    status: 'pending',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    paid_at: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'invoice', id, invNum, `${shipment.tracking_number} — ${formatCurrency(amount)}`);
  notifyUser(data, shipment.customer_id, 'New Invoice', `Invoice for ${shipment.tracking_number}`, 'info');
}

export function payInvoice(data: AppData, user: AuthUser, invoiceId: number): void {
  const inv = data.invoices.find((i) => i.id === invoiceId);
  if (inv) {
    inv.status = 'paid';
    inv.paid_at = ts();
    logCrud(data, user, 'update', 'invoice', invoiceId, inv.invoice_number, 'Marked as paid');
  }
}

export function createTicket(data: AppData, user: AuthUser, subject: string, description: string, priority: Priority = 'normal'): void {
  const ticketNum = generateTicketNumber(data);
  const id = nextId(data, 'supportTickets');
  data.supportTickets.unshift({
    id,
    ticket_number: ticketNum,
    customer_id: user.id,
    subject,
    description,
    status: 'open',
    priority,
    assigned_to: null,
    resolved_at: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'support_ticket', id, ticketNum, subject);
  notifyRole(data, 'customer-service', 'New Ticket', subject, 'warning');
}

export function resolveTicket(data: AppData, user: AuthUser, ticketId: number): void {
  const t = data.supportTickets.find((x) => x.id === ticketId);
  if (t) {
    t.status = 'resolved';
    t.resolved_at = ts();
    t.assigned_to = user.id;
    logCrud(data, user, 'update', 'support_ticket', ticketId, t.ticket_number, 'Resolved');
  }
}

export function approvePlan(data: AppData, user: AuthUser, planId: number): void {
  const p = data.logisticsPlans.find((x) => x.id === planId);
  if (p) {
    p.status = 'approved';
    p.approved_by = user.id;
    logCrud(data, user, 'update', 'logistics_plan', planId, p.title, 'Approved');
  }
}

export function toggleUserStatus(data: AppData, user: AuthUser, targetId: number, status: 'active' | 'suspended'): void {
  const u = data.users.find((x) => x.id === targetId);
  if (u) {
    u.status = status;
    logCrud(data, user, 'update', 'user', targetId, u.email, status === 'suspended' ? 'Suspended' : 'Activated');
  }
}

export type UserAdminPayload = {
  full_name: string;
  email: string;
  password: string;
  role: RoleKey;
  branch_id?: number | null;
  phone?: string;
  status?: UserStatus;
};

export type UserAdminUpdatePayload = {
  full_name?: string;
  email?: string;
  password?: string;
  role?: RoleKey;
  branch_id?: number | null;
  phone?: string;
  status?: UserStatus;
};

export function createUser(data: AppData, admin: AuthUser, payload: UserAdminPayload): { ok: boolean; error?: string } {
  const email = payload.email.trim().toLowerCase();
  if (!payload.full_name.trim() || !email || !payload.password.trim()) {
    return { ok: false, error: 'Name, email, and password are required.' };
  }
  if (payload.password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }
  if (data.users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: 'Email already exists.' };
  }
  const id = nextId(data, 'users');
  data.users.push({
    id,
    full_name: payload.full_name.trim(),
    email,
    password: payload.password,
    role: payload.role,
    branch_id: payload.branch_id ?? null,
    phone: payload.phone?.trim() || undefined,
    status: payload.status ?? 'active',
    created_at: ts(),
  });
  logCrud(data, admin, 'create', 'user', id, email, `${payload.full_name.trim()} · ${payload.role}`);
  return { ok: true };
}

export function updateUser(
  data: AppData,
  admin: AuthUser,
  userId: number,
  payload: UserAdminUpdatePayload
): { ok: boolean; error?: string } {
  const target = data.users.find((u) => u.id === userId);
  if (!target) return { ok: false, error: 'User not found.' };

  if (payload.email !== undefined) {
    const email = payload.email.trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email is required.' };
    if (data.users.some((u) => u.id !== userId && u.email.toLowerCase() === email)) {
      return { ok: false, error: 'Email already in use.' };
    }
    target.email = email;
  }

  if (payload.full_name !== undefined) {
    if (!payload.full_name.trim()) return { ok: false, error: 'Name is required.' };
    target.full_name = payload.full_name.trim();
  }

  if (payload.password !== undefined && payload.password.trim()) {
    if (payload.password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    target.password = payload.password;
  }

  if (payload.role !== undefined) {
    if (target.role === 'super-admin' && payload.role !== 'super-admin') {
      const superAdmins = data.users.filter((u) => u.role === 'super-admin');
      if (superAdmins.length <= 1) {
        return { ok: false, error: 'Cannot change role of the only Super Admin.' };
      }
    }
    target.role = payload.role;
  }

  if (payload.branch_id !== undefined) target.branch_id = payload.branch_id;
  if (payload.phone !== undefined) target.phone = payload.phone.trim() || undefined;
  if (payload.status !== undefined) target.status = payload.status;

  logCrud(data, admin, 'update', 'user', userId, target.email, `Updated ${target.full_name}`);
  return { ok: true };
}

export function deleteUser(data: AppData, admin: AuthUser, userId: number): { ok: boolean; error?: string } {
  if (userId === admin.id) return { ok: false, error: 'You cannot delete your own account.' };

  const target = data.users.find((u) => u.id === userId);
  if (!target) return { ok: false, error: 'User not found.' };

  if (target.role === 'super-admin') {
    const superAdmins = data.users.filter((u) => u.role === 'super-admin');
    if (superAdmins.length <= 1) return { ok: false, error: 'Cannot delete the only Super Admin.' };
  }

  const label = `${target.full_name} (${target.email})`;
  data.users = data.users.filter((u) => u.id !== userId);
  logCrud(data, admin, 'delete', 'user', userId, target.email, label);
  return { ok: true };
}

export function registerUser(
  data: AppData,
  payload: { full_name: string; email: string; password: string; role: RoleKey; branch_id?: number | null; phone?: string }
): boolean {
  if (data.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) return false;
  const id = nextId(data, 'users');
  data.users.push({
    id,
    full_name: payload.full_name,
    email: payload.email,
    password: payload.password,
    role: payload.role,
    branch_id: payload.branch_id ?? null,
    phone: payload.phone,
    status: 'active',
    created_at: ts(),
  });
  logCrud(data, { id, role: payload.role }, 'create', 'user', id, payload.email, `Registered as ${payload.role}`);
  notifyRole(data, 'super-admin', 'New User Registration', `${payload.full_name} registered`, 'info');
  return true;
}

export function approveStockMovement(data: AppData, user: AuthUser, movementId: number): void {
  const m = data.stockMovements.find((x) => x.id === movementId);
  if (m) {
    m.status = 'approved';
    m.approved_by = user.id;
    const item = data.inventoryItems.find((i) => i.id === m.item_id);
    logCrud(data, user, 'update', 'stock_movement', movementId, item?.sku ?? `#${movementId}`, 'Approved');
  }
}

export function createStockMovement(data: AppData, user: AuthUser, itemId: number, qty: number, type: 'in' | 'out' | 'transfer' | 'adjustment'): void {
  const item = data.inventoryItems.find((i) => i.id === itemId);
  const id = nextId(data, 'stockMovements');
  data.stockMovements.unshift({
    id,
    item_id: itemId,
    movement_type: type,
    quantity: qty,
    status: 'pending',
    requested_by: user.id,
    approved_by: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'stock_movement', id, item?.sku ?? `#${itemId}`, `${type} × ${qty}`);
}

export function scheduleMaintenance(data: AppData, user: AuthUser, vehicleId: number, type: string, date: string): void {
  const v = data.vehicles.find((x) => x.id === vehicleId);
  const id = nextId(data, 'vehicleMaintenance');
  data.vehicleMaintenance.unshift({
    id,
    vehicle_id: vehicleId,
    technician_id: user.id,
    type,
    cost: 0,
    status: 'scheduled',
    scheduled_date: date,
  });
  logCrud(data, user, 'create', 'maintenance', id, v?.plate_number ?? `#${vehicleId}`, type);
}

export function assignTask(data: AppData, user: AuthUser, title: string, assignTo: number): void {
  const id = nextId(data, 'operationalTasks');
  data.operationalTasks.unshift({
    id,
    title,
    assigned_to: assignTo,
    assigned_by: user.id,
    status: 'pending',
    due_date: ts().slice(0, 10),
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'task', id, title, `Assigned to user #${assignTo}`);
  notifyUser(data, assignTo, 'New Task', title, 'info');
}

export function backupData(data: AppData): string {
  logCrud(data, null, 'create', 'system_backup', null, 'lms-backup.json', `${data.users.length} users, ${data.shipments.length} shipments`);
  return JSON.stringify(data, null, 2);
}

export function markNotificationRead(data: AppData, notificationId: number): void {
  const n = data.notifications.find((x) => x.id === notificationId);
  if (n) n.is_read = true;
}

export function markAllNotificationsRead(data: AppData, userId: number): void {
  data.notifications.filter((n) => n.user_id === userId).forEach((n) => { n.is_read = true; });
}

export function verifyPacking(data: AppData, user: AuthUser, recordId: number): void {
  const r = data.packingRecords.find((x) => x.id === recordId);
  if (r) {
    r.verified = true;
    const s = data.shipments.find((x) => x.id === r.shipment_id);
    logCrud(data, user, 'update', 'packing_record', recordId, s?.tracking_number ?? `#${recordId}`, 'Contents verified');
  }
}

export function unloadShipment(data: AppData, user: AuthUser, shipmentId: number): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.loadingRecords.unshift({
    id: nextId(data, 'loadingRecords'),
    shipment_id: shipmentId,
    staff_id: user.id,
    action_type: 'unload',
    condition_status: 'good',
    recorded_at: ts(),
  });
  logShipmentStatus(data, shipmentId, 'delivered', user.id, 'Cargo unloaded');
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, 'Cargo unloaded');
}

export function reportDamage(data: AppData, user: AuthUser, shipmentId: number, notes: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.loadingRecords.unshift({
    id: nextId(data, 'loadingRecords'),
    shipment_id: shipmentId,
    staff_id: user.id,
    action_type: 'load',
    condition_status: 'damaged',
    damage_notes: notes,
    recorded_at: ts(),
  });
  logShipmentStatus(data, shipmentId, 'issue', user.id, 'Damage reported: ' + notes);
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, notes);
  notifyRole(data, 'quality-assurance', 'Damage Reported', notes, 'warning');
}

export function updateInventoryItem(data: AppData, user: AuthUser, itemId: number, quantity: number): void {
  const item = data.inventoryItems.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    item.status = quantity <= 0 ? 'out_of_stock' : quantity <= item.min_quantity ? 'low_stock' : 'available';
    logCrud(data, user, 'update', 'inventory_item', itemId, item.sku, `Qty set to ${quantity}`);
  }
}

export function completeMaintenanceJob(data: AppData, user: AuthUser, jobId: number): void {
  const job = data.vehicleMaintenance.find((j) => j.id === jobId);
  if (job) {
    job.status = 'completed';
    job.technician_id = user.id;
    const v = data.vehicles.find((x) => x.id === job.vehicle_id);
    logCrud(data, user, 'update', 'maintenance', jobId, v?.plate_number ?? `#${jobId}`, 'Job completed');
  }
}

export function takeTicket(data: AppData, user: AuthUser, ticketId: number): void {
  const t = data.supportTickets.find((x) => x.id === ticketId);
  if (t && t.status === 'open') {
    t.status = 'in_progress';
    t.assigned_to = user.id;
    logCrud(data, user, 'update', 'support_ticket', ticketId, t.ticket_number, 'Taken by agent');
  }
}

export function recordFuelLog(data: AppData, user: AuthUser, vehicleId: number, liters: number, cost: number): void {
  const v = data.vehicles.find((x) => x.id === vehicleId);
  const id = nextId(data, 'fuelLogs');
  data.fuelLogs.unshift({
    id,
    vehicle_id: vehicleId,
    liters,
    cost,
    odometer: 0,
    logged_by: user.id,
    logged_at: ts(),
  });
  if (v) v.fuel_level = Math.min(100, v.fuel_level + Math.round(liters / 2));
  logCrud(data, user, 'create', 'fuel_log', id, v?.plate_number ?? `#${vehicleId}`, `${liters}L — ${formatCurrency(cost)}`);
}

export function createRoute(data: AppData, user: AuthUser, name: string, distance: number): void {
  const id = nextId(data, 'deliveryRoutes');
  data.deliveryRoutes.unshift({
    id,
    route_name: name,
    distance_km: distance,
    status: 'planned',
    planner_id: user.id,
  });
  logCrud(data, user, 'create', 'delivery_route', id, name, `${distance} km`);
}

// Re-export for backward compatibility
export { logCrud } from '@/lib/crudLog';
