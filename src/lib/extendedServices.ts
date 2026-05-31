import type { AppData, AuthUser, RoleKey } from '@/types';
import { logCrud } from '@/lib/crudLog';
import { formatCurrency, nextId } from './store';

function ts(): string {
  return new Date().toISOString();
}

function audit(data: AppData, userId: number, action: string, entityType: string, entityId: number | null, details?: string) {
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

// ─── Vehicles ───
export function createVehicle(
  data: AppData,
  user: AuthUser,
  payload: { plate_number: string; model: string; type: 'truck' | 'van' | 'motorcycle' | 'container'; capacity_kg: number }
): number {
  const id = nextId(data, 'vehicles');
  data.vehicles.unshift({
    id,
    plate_number: payload.plate_number,
    model: payload.model,
    type: payload.type,
    capacity_kg: payload.capacity_kg,
    fuel_level: 100,
    status: 'available',
    branch_id: user.branch_id,
    assigned_driver_id: null,
    last_maintenance: null,
  });
  logCrud(data, user, 'create', 'vehicle', id, payload.plate_number, payload.model);
  return id;
}

export function updateVehicle(
  data: AppData,
  user: AuthUser,
  vehicleId: number,
  payload: Partial<{ plate_number: string; model: string; status: 'available' | 'in_use' | 'maintenance' | 'retired'; fuel_level: number }>
): void {
  const v = data.vehicles.find((x) => x.id === vehicleId);
  if (!v) return;
  Object.assign(v, payload);
  logCrud(data, user, 'update', 'vehicle', vehicleId, v.plate_number, 'Vehicle updated');
}

export function deleteVehicle(data: AppData, user: AuthUser, vehicleId: number): boolean {
  const v = data.vehicles.find((x) => x.id === vehicleId);
  if (!v || v.status === 'in_use') return false;
  data.vehicles = data.vehicles.filter((x) => x.id !== vehicleId);
  logCrud(data, user, 'delete', 'vehicle', vehicleId, v.plate_number, 'Removed from fleet');
  return true;
}

// ─── Logistics plans ───
export function createLogisticsPlan(data: AppData, user: AuthUser, title: string, description: string): void {
  const id = nextId(data, 'logisticsPlans');
  data.logisticsPlans.unshift({
    id,
    title,
    description,
    created_by: user.id,
    approved_by: null,
    status: 'pending_approval',
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'logistics_plan', id, title, 'Submitted for approval');
}

export function rejectPlan(data: AppData, user: AuthUser, planId: number): void {
  const p = data.logisticsPlans.find((x) => x.id === planId);
  if (p) {
    p.status = 'rejected';
    logCrud(data, user, 'update', 'logistics_plan', planId, p.title, 'Rejected');
  }
}

export function deleteLogisticsPlan(data: AppData, user: AuthUser, planId: number): void {
  const p = data.logisticsPlans.find((x) => x.id === planId);
  if (p) {
    data.logisticsPlans = data.logisticsPlans.filter((x) => x.id !== planId);
    logCrud(data, user, 'delete', 'logistics_plan', planId, p.title, 'Plan deleted');
  }
}

// ─── Tasks ───
export function updateTaskStatus(data: AppData, user: AuthUser, taskId: number, status: 'in_progress' | 'completed' | 'cancelled'): void {
  const t = data.operationalTasks.find((x) => x.id === taskId);
  if (t) {
    t.status = status;
    logCrud(data, user, 'update', 'task', taskId, t.title, `Status → ${status}`);
  }
}

export function deleteTask(data: AppData, user: AuthUser, taskId: number): void {
  const t = data.operationalTasks.find((x) => x.id === taskId);
  if (t) {
    data.operationalTasks = data.operationalTasks.filter((x) => x.id !== taskId);
    logCrud(data, user, 'delete', 'task', taskId, t.title, 'Task removed');
  }
}

// ─── Stock ───
export function createStockAudit(data: AppData, user: AuthUser, itemId: number, countedQty: number, notes: string): void {
  const item = data.inventoryItems.find((i) => i.id === itemId);
  const id = nextId(data, 'stockMovements');
  data.stockMovements.unshift({
    id,
    item_id: itemId,
    movement_type: 'adjustment',
    quantity: countedQty,
    status: 'completed',
    requested_by: user.id,
    approved_by: user.id,
    notes: `Audit: ${notes}. Counted ${countedQty}`,
    created_at: ts(),
  });
  if (item) {
    item.quantity = countedQty;
    item.status = countedQty <= 0 ? 'out_of_stock' : countedQty <= item.min_quantity ? 'low_stock' : 'available';
  }
  logCrud(data, user, 'create', 'stock_audit', id, item?.sku ?? `#${itemId}`, notes);
}

export function rejectStockMovement(data: AppData, user: AuthUser, movementId: number): void {
  const m = data.stockMovements.find((x) => x.id === movementId);
  if (m) {
    m.status = 'rejected';
    const item = data.inventoryItems.find((i) => i.id === m.item_id);
    logCrud(data, user, 'update', 'stock_movement', movementId, item?.sku ?? `#${movementId}`, 'Rejected');
  }
}

// ─── Routes ───
export function updateRoute(
  data: AppData,
  user: AuthUser,
  routeId: number,
  payload: Partial<{ route_name: string; distance_km: number; status: 'planned' | 'active' | 'completed' | 'cancelled' }>
): void {
  const r = data.deliveryRoutes.find((x) => x.id === routeId);
  if (r) {
    Object.assign(r, payload);
    logCrud(data, user, 'update', 'delivery_route', routeId, r.route_name, 'Route updated');
  }
}

export function deleteRoute(data: AppData, user: AuthUser, routeId: number): void {
  const r = data.deliveryRoutes.find((x) => x.id === routeId);
  if (r) {
    data.deliveryRoutes = data.deliveryRoutes.filter((x) => x.id !== routeId);
    logCrud(data, user, 'delete', 'delivery_route', routeId, r.route_name, 'Route deleted');
  }
}

// ─── Transport / dispatch ───
export function assignTransport(
  data: AppData,
  user: AuthUser,
  payload: { shipment_id: number; driver_id: number; vehicle_id: number; route_id?: number }
): void {
  const shipment = data.shipments.find((s) => s.id === payload.shipment_id);
  if (!shipment) return;
  const id = nextId(data, 'deliveryAssignments');
  data.deliveryAssignments.unshift({
    id,
    shipment_id: payload.shipment_id,
    driver_id: payload.driver_id,
    vehicle_id: payload.vehicle_id,
    dispatcher_id: user.id,
    route_id: payload.route_id ?? null,
    status: 'assigned',
    assigned_at: ts(),
  });
  shipment.status = 'dispatched';
  shipment.updated_at = ts();
  logCrud(data, user, 'create', 'transport_assignment', id, shipment.tracking_number, 'Transport coordinated');
}

// ─── Delivery events (driver / courier) ───
export function recordDeliveryEvent(
  data: AppData,
  user: AuthUser,
  assignmentId: number,
  eventType: 'pod' | 'signature' | 'evidence' | 'incident' | 'progress',
  notes: string
): void {
  const a = data.deliveryAssignments.find((x) => x.id === assignmentId);
  const s = data.shipments.find((x) => x.id === a?.shipment_id);
  audit(data, user.id, `delivery_${eventType}`, 'delivery_assignment', assignmentId, notes);
  logCrud(data, user, 'create', 'delivery_event', assignmentId, s?.tracking_number ?? `#${assignmentId}`, `${eventType}: ${notes}`);
  if (eventType === 'progress' && a && a.status === 'assigned') a.status = 'in_transit';
}

// ─── QA / compliance ───
export function reportDamagedItem(data: AppData, user: AuthUser, shipmentId: number, notes: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.qualityInspections.unshift({
    id: nextId(data, 'qualityInspections'),
    shipment_id: shipmentId,
    inspector_id: user.id,
    result: 'failed',
    damage_report: notes,
    inspected_at: ts(),
  });
  if (shipment) {
    shipment.status = 'issue';
    shipment.updated_at = ts();
  }
  logCrud(data, user, 'create', 'damage_report', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, notes);
}

export function createComplianceRecord(data: AppData, user: AuthUser, title: string, notes: string): void {
  const id = nextId(data, 'auditLogs');
  audit(data, user.id, 'compliance_check', 'compliance', id, `${title}: ${notes}`);
  logCrud(data, user, 'create', 'compliance', id, title, notes);
}

// ─── Cargo / coordination ───
export function updateCargoStatus(data: AppData, user: AuthUser, shipmentId: number, status: string, notes: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  data.loadingRecords.unshift({
    id: nextId(data, 'loadingRecords'),
    shipment_id: shipmentId,
    staff_id: user.id,
    action_type: 'load',
    condition_status: 'good',
    damage_notes: notes,
    recorded_at: ts(),
  });
  logCrud(data, user, 'update', 'cargo_status', shipmentId, shipment?.tracking_number ?? `#${shipmentId}`, `${status}: ${notes}`);
}

export function coordinateShipment(data: AppData, user: AuthUser, shipmentId: number, notes: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  if (shipment) {
    shipment.coordinator_id = user.id;
    shipment.updated_at = ts();
    data.shipmentStatusLogs.unshift({
      id: nextId(data, 'shipmentStatusLogs'),
      shipment_id: shipmentId,
      status: shipment.status,
      notes: `Coordination: ${notes}`,
      updated_by: user.id,
      created_at: ts(),
    });
    logCrud(data, user, 'update', 'shipment', shipmentId, shipment.tracking_number, notes);
  }
}

// ─── Supplier / procurement ───
export function updateSupplierShipmentInfo(data: AppData, user: AuthUser, poId: number, info: string, expectedDate?: string): void {
  const po = data.purchaseOrders.find((p) => p.id === poId && p.supplier_id === user.id);
  if (po) {
    if (expectedDate) po.expected_delivery = expectedDate;
    logCrud(data, user, 'update', 'purchase_order', poId, po.po_number, info);
  }
}

export function deletePurchaseOrder(data: AppData, user: AuthUser, poId: number): boolean {
  const po = data.purchaseOrders.find((p) => p.id === poId);
  if (!po || po.status !== 'draft') return false;
  data.purchaseOrders = data.purchaseOrders.filter((p) => p.id !== poId);
  logCrud(data, user, 'delete', 'purchase_order', poId, po.po_number, 'PO cancelled');
  return true;
}

// ─── Finance ───
export function recordPayment(data: AppData, user: AuthUser, invoiceId: number, amount: number): void {
  const inv = data.invoices.find((i) => i.id === invoiceId);
  if (inv) {
    inv.status = 'paid';
    inv.paid_at = ts();
    logCrud(data, user, 'update', 'invoice', invoiceId, inv.invoice_number, `Payment ${formatCurrency(amount)}`);
  }
}

export function cancelInvoice(data: AppData, user: AuthUser, invoiceId: number): void {
  const inv = data.invoices.find((i) => i.id === invoiceId);
  if (inv && inv.status === 'pending') {
    inv.status = 'cancelled';
    logCrud(data, user, 'delete', 'invoice', invoiceId, inv.invoice_number, 'Invoice cancelled');
  }
}

export function createCustomerTicket(data: AppData, user: AuthUser, customerId: number, subject: string, description: string, priority: 'normal' | 'high' | 'urgent' = 'normal'): void {
  const ticketNum = `TKT-${String(nextId(data, 'supportTickets')).padStart(5, '0')}`;
  const id = nextId(data, 'supportTickets');
  data.supportTickets.unshift({
    id,
    ticket_number: ticketNum,
    customer_id: customerId,
    subject,
    description,
    status: 'open',
    priority,
    assigned_to: user.id,
    resolved_at: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'support_ticket', id, ticketNum, subject);
}

// ─── Security ───
export function updateUserAccess(data: AppData, user: AuthUser, targetId: number, status: 'active' | 'suspended'): void {
  const u = data.users.find((x) => x.id === targetId);
  if (u) {
    u.status = status;
    logCrud(data, user, 'update', 'user_access', targetId, u.email, status === 'suspended' ? 'Access suspended' : 'Access restored');
  }
}

// ─── Warehouse activity ───
export function logWarehouseActivity(data: AppData, user: AuthUser, activity: string, notes: string): void {
  audit(data, user.id, 'warehouse_activity', 'warehouse', null, `${activity}: ${notes}`);
  logCrud(data, user, 'create', 'warehouse_activity', null, activity, notes);
}

// ─── Maintenance repair log ───
export function updateRepairLog(data: AppData, user: AuthUser, jobId: number, description: string, cost: number): void {
  const job = data.vehicleMaintenance.find((j) => j.id === jobId);
  if (job) {
    job.description = description;
    job.cost = cost;
    job.status = 'in_progress';
    logCrud(data, user, 'update', 'maintenance', jobId, job.type, description);
  }
}

export function deleteMaintenanceJob(data: AppData, user: AuthUser, jobId: number): boolean {
  const job = data.vehicleMaintenance.find((j) => j.id === jobId);
  if (!job || job.status === 'completed') return false;
  data.vehicleMaintenance = data.vehicleMaintenance.filter((j) => j.id !== jobId);
  logCrud(data, user, 'delete', 'maintenance', jobId, job.type, 'Job cancelled');
  return true;
}

// ─── Logistics manager / shipment oversight ───
export function updateShipmentPriority(
  data: AppData,
  user: AuthUser,
  shipmentId: number,
  priority: 'normal' | 'high' | 'urgent',
  notes: string
): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return;
  shipment.priority = priority;
  shipment.updated_at = ts();
  data.shipmentStatusLogs.unshift({
    id: nextId(data, 'shipmentStatusLogs'),
    shipment_id: shipmentId,
    status: shipment.status,
    notes: `Priority → ${priority}: ${notes}`,
    updated_by: user.id,
    created_at: ts(),
  });
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment.tracking_number, `Priority ${priority}`);
}

// ─── Dispatcher scheduling ───
export function scheduleDispatch(data: AppData, user: AuthUser, assignmentId: number, scheduledDate: string, notes: string): void {
  const a = data.deliveryAssignments.find((x) => x.id === assignmentId);
  const s = data.shipments.find((x) => x.id === a?.shipment_id);
  if (!a || !s) return;
  data.shipmentStatusLogs.unshift({
    id: nextId(data, 'shipmentStatusLogs'),
    shipment_id: s.id,
    status: s.status,
    notes: `Scheduled ${scheduledDate}: ${notes}`,
    updated_by: user.id,
    created_at: ts(),
  });
  logCrud(data, user, 'update', 'delivery_assignment', assignmentId, s.tracking_number, `Scheduled ${scheduledDate}`);
}

export function linkRouteToShipment(data: AppData, user: AuthUser, shipmentId: number, routeId: number): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  const route = data.deliveryRoutes.find((r) => r.id === routeId);
  if (!shipment || !route) return;
  shipment.route_id = routeId;
  shipment.updated_at = ts();
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment.tracking_number, `Route: ${route.route_name}`);
}

export function updateDispatchStatus(data: AppData, user: AuthUser, assignmentId: number, status: 'assigned' | 'in_transit' | 'delivered'): void {
  const a = data.deliveryAssignments.find((x) => x.id === assignmentId);
  const s = data.shipments.find((x) => x.id === a?.shipment_id);
  if (!a || !s) return;
  a.status = status;
  if (status === 'in_transit') s.status = 'in_transit';
  if (status === 'delivered') {
    s.status = 'delivered';
    s.delivered_at = ts();
  }
  s.updated_at = ts();
  logCrud(data, user, 'update', 'delivery_assignment', assignmentId, s.tracking_number, `Status → ${status}`);
}

// ─── Procurement / vendor ───
export function markPOReceived(data: AppData, user: AuthUser, poId: number, notes: string): void {
  const po = data.purchaseOrders.find((p) => p.id === poId);
  if (!po || !['shipped', 'confirmed'].includes(po.status)) return;
  po.status = 'received';
  logCrud(data, user, 'update', 'purchase_order', poId, po.po_number, notes || 'Goods received');
}

export function logVendorCoordination(data: AppData, user: AuthUser, supplierId: number, message: string): void {
  const supplier = data.users.find((u) => u.id === supplierId);
  audit(data, user.id, 'vendor_coordination', 'purchase_order', supplierId, message);
  logCrud(data, user, 'create', 'vendor_message', supplierId, supplier?.full_name ?? `#${supplierId}`, message);
}

// ─── Finance costs ───
export function logLogisticsCost(data: AppData, user: AuthUser, category: string, amount: number, notes: string): void {
  audit(data, user.id, 'logistics_cost', 'finance', null, `${category}: ${formatCurrency(amount)} — ${notes}`);
  logCrud(data, user, 'create', 'logistics_cost', null, category, `${formatCurrency(amount)} — ${notes}`);
}

// ─── Auditor ───
export function flagAuditItem(data: AppData, user: AuthUser, auditLogId: number, notes: string): void {
  const entry = data.auditLogs.find((a) => a.id === auditLogId);
  if (!entry) return;
  audit(data, user.id, 'audit_flag', entry.entity_type, entry.entity_id, `Flagged: ${notes}`);
  logCrud(data, user, 'update', 'audit_flag', auditLogId, entry.action, notes);
}

export function recordComplianceFinding(data: AppData, user: AuthUser, title: string, notes: string): void {
  audit(data, user.id, 'compliance_finding', 'compliance', null, `${title}: ${notes}`);
  logCrud(data, user, 'create', 'compliance_finding', null, title, notes);
}

// ─── Security ───
export function logSecurityReview(data: AppData, user: AuthUser, targetEmail: string, action: string, notes: string): void {
  data.accessLogs.unshift({
    id: nextId(data, 'accessLogs'),
    user_id: user.id,
    email: targetEmail,
    action: `security_review: ${action}`,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'security_review', null, targetEmail, `${action}: ${notes}`);
}

// ─── Maintenance records ───
export function addMaintenanceRecord(data: AppData, user: AuthUser, vehicleId: number, type: string, notes: string): void {
  const v = data.vehicles.find((x) => x.id === vehicleId);
  const id = nextId(data, 'vehicleMaintenance');
  data.vehicleMaintenance.unshift({
    id,
    vehicle_id: vehicleId,
    technician_id: user.id,
    type,
    description: notes,
    cost: 0,
    status: 'scheduled',
    scheduled_date: ts().slice(0, 10),
  });
  logCrud(data, user, 'create', 'maintenance', id, v?.plate_number ?? `#${vehicleId}`, `${type}: ${notes}`);
}

// ─── Branch manager ───
export function assignBranchTask(data: AppData, user: AuthUser, title: string, assignTo: number): void {
  const id = nextId(data, 'operationalTasks');
  data.operationalTasks.unshift({
    id,
    title: `[Branch] ${title}`,
    assigned_to: assignTo,
    assigned_by: user.id,
    status: 'pending',
    due_date: ts().slice(0, 10),
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'branch_task', id, title, `Assigned to user #${assignTo}`);
}

export function adjustBranchInventory(data: AppData, user: AuthUser, itemId: number, minQty: number): void {
  const item = data.inventoryItems.find((i) => i.id === itemId);
  if (!item) return;
  item.min_quantity = minQty;
  item.status = item.quantity <= 0 ? 'out_of_stock' : item.quantity <= minQty ? 'low_stock' : 'available';
  logCrud(data, user, 'update', 'inventory_item', itemId, item.sku, `Min qty → ${minQty}`);
}

// ─── Shipment coordinator / packing ───
export function addShipmentTrackingNote(data: AppData, user: AuthUser, shipmentId: number, notes: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return;
  data.shipmentStatusLogs.unshift({
    id: nextId(data, 'shipmentStatusLogs'),
    shipment_id: shipmentId,
    status: shipment.status,
    notes,
    updated_by: user.id,
    created_at: ts(),
  });
  shipment.updated_at = ts();
  logCrud(data, user, 'update', 'shipment', shipmentId, shipment.tracking_number, notes);
}

export function addPackingNote(data: AppData, user: AuthUser, recordId: number, notes: string): void {
  const r = data.packingRecords.find((x) => x.id === recordId);
  const s = data.shipments.find((x) => x.id === r?.shipment_id);
  if (!r) return;
  audit(data, user.id, 'packing_note', 'packing_record', recordId, notes);
  logCrud(data, user, 'update', 'packing_record', recordId, s?.tracking_number ?? `#${recordId}`, notes);
}

// ─── Inventory restock ───
export function restockItem(data: AppData, user: AuthUser, itemId: number, qty: number): void {
  const item = data.inventoryItems.find((i) => i.id === itemId);
  if (!item) return;
  const id = nextId(data, 'stockMovements');
  data.stockMovements.unshift({
    id,
    item_id: itemId,
    movement_type: 'in',
    quantity: qty,
    status: 'completed',
    requested_by: user.id,
    approved_by: user.id,
    notes: 'Restock',
    created_at: ts(),
  });
  item.quantity += qty;
  item.status = item.quantity <= item.min_quantity ? 'low_stock' : 'available';
  logCrud(data, user, 'create', 'stock_movement', id, item.sku, `Restock +${qty}`);
}

// ─── Data analyst export ───
export function exportAnalyticsSnapshot(data: AppData, user: AuthUser, reportName: string): void {
  logCrud(data, user, 'create', 'analytics_export', null, reportName, `${data.shipments.length} shipments, ${data.deliveryAssignments.length} deliveries`);
}

// ─── Customer ticket from history ───
export function createTicketFromShipment(data: AppData, user: AuthUser, shipmentId: number, subject: string, description: string): void {
  const shipment = data.shipments.find((s) => s.id === shipmentId && s.customer_id === user.id);
  if (!shipment) return;
  const ticketNum = `TKT-${String(nextId(data, 'supportTickets')).padStart(5, '0')}`;
  const id = nextId(data, 'supportTickets');
  data.supportTickets.unshift({
    id,
    ticket_number: ticketNum,
    customer_id: user.id,
    subject: `${subject} (${shipment.tracking_number})`,
    description,
    status: 'open',
    priority: 'normal',
    assigned_to: null,
    resolved_at: null,
    created_at: ts(),
  });
  logCrud(data, user, 'create', 'support_ticket', id, ticketNum, subject);
}
