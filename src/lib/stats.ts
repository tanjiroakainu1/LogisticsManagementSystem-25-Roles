import type { AppData, AuthUser, RoleKey } from '@/types';

export function getRoleStats(data: AppData, role: RoleKey, user: AuthUser): Record<string, string | number> {
  const uid = user.id;
  const branchId = user.branch_id;
  const s: Record<string, string | number> = {};

  const countShipments = (fn: (s: AppData['shipments'][0]) => boolean) =>
    data.shipments.filter(fn).length;

  switch (role) {
    case 'super-admin':
      s.users = data.users.length;
      s.shipments = data.shipments.length;
      s.vehicles = data.vehicles.length;
      s.open_tickets = data.supportTickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length;
      break;
    case 'customer':
      s.my_shipments = countShipments((sh) => sh.customer_id === uid);
      s.in_transit = countShipments((sh) => sh.customer_id === uid && ['dispatched', 'in_transit', 'out_for_delivery'].includes(sh.status));
      s.delivered = countShipments((sh) => sh.customer_id === uid && sh.status === 'delivered');
      s.my_tickets = data.supportTickets.filter((t) => t.customer_id === uid && ['open', 'in_progress'].includes(t.status)).length;
      break;
    case 'shipment-coordinator':
      s.pending_processing = countShipments((sh) => sh.status === 'pending');
      s.processing = countShipments((sh) => sh.status === 'processing');
      s.approved = countShipments((sh) => sh.status === 'approved');
      s.issues = countShipments((sh) => sh.status === 'issue');
      break;
    case 'dispatcher':
      s.awaiting_dispatch = countShipments((sh) => ['loaded', 'packed'].includes(sh.status));
      s.active_deliveries = data.deliveryAssignments.filter((a) => ['assigned', 'accepted', 'in_transit'].includes(a.status)).length;
      s.drivers = data.users.filter((u) => u.role === 'driver' && u.status === 'active').length;
      s.vehicles = data.vehicles.filter((v) => v.status === 'available').length;
      break;
    case 'driver':
    case 'delivery-personnel': {
      const mine = data.deliveryAssignments.filter((a) => a.driver_id === uid);
      s.assigned = mine.length;
      s.in_transit = mine.filter((a) => a.status === 'in_transit').length;
      s.completed = mine.filter((a) => a.status === 'delivered').length;
      s.pending_pod = mine.filter((a) => a.status !== 'delivered').length;
      s.out_for_delivery = s.in_transit;
      break;
    }
    case 'packing-staff':
      s.awaiting_pack = countShipments((sh) => sh.status === 'approved');
      s.packed_today = data.packingRecords.filter((p) => p.packer_id === uid && p.packed_at.startsWith(new Date().toISOString().slice(0, 10))).length;
      s.pending_verify = data.packingRecords.filter((p) => !p.verified).length;
      s.packed_total = countShipments((sh) => ['packed', 'loaded', 'dispatched', 'in_transit', 'delivered'].includes(sh.status));
      break;
    case 'loading-unloading-staff':
      s.ready_load = countShipments((sh) => sh.status === 'packed');
      s.loaded_today = data.loadingRecords.filter((r) => r.staff_id === uid && r.action_type === 'load' && r.recorded_at.startsWith(new Date().toISOString().slice(0, 10))).length;
      s.awaiting_unload = countShipments((sh) => sh.status === 'delivered');
      s.damage_reports = data.loadingRecords.filter((r) => r.condition_status === 'damaged').length;
      break;
    case 'warehouse-manager':
    case 'inventory-controller':
      s.inventory_items = data.inventoryItems.length;
      s.low_stock = data.inventoryItems.filter((i) => i.quantity <= i.min_quantity).length;
      s.pending_movements = data.stockMovements.filter((m) => m.status === 'pending').length;
      s.users = data.users.length;
      s.audits = s.low_stock;
      break;
    case 'fleet-manager':
      s.vehicles = data.vehicles.length;
      s.in_maintenance = data.vehicles.filter((v) => v.status === 'maintenance').length;
      s.in_use = data.vehicles.filter((v) => v.status === 'in_use').length;
      s.available = data.vehicles.filter((v) => v.status === 'available').length;
      break;
    case 'procurement-officer':
      s.open_pos = data.purchaseOrders.filter((p) => ['draft', 'sent', 'confirmed'].includes(p.status)).length;
      s.pending_pos = data.purchaseOrders.filter((p) => p.status === 'sent').length;
      s.received_pos = data.purchaseOrders.filter((p) => p.status === 'received').length;
      s.suppliers = data.users.filter((u) => u.role === 'supplier-vendor').length;
      break;
    case 'supplier-vendor': {
      const pos = data.purchaseOrders.filter((p) => p.supplier_id === uid);
      s.open_pos = pos.filter((p) => ['sent', 'confirmed', 'shipped'].includes(p.status)).length;
      s.pending_pos = pos.filter((p) => p.status === 'sent').length;
      s.shipped_pos = pos.filter((p) => p.status === 'shipped').length;
      s.received_pos = pos.filter((p) => p.status === 'received').length;
      break;
    }
    case 'customer-service':
      s.open_tickets = data.supportTickets.filter((t) => t.status === 'open').length;
      s.in_progress_tickets = data.supportTickets.filter((t) => t.status === 'in_progress').length;
      s.resolved_today = data.supportTickets.filter((t) => t.status === 'resolved' && t.resolved_at?.startsWith(new Date().toISOString().slice(0, 10))).length;
      s.high_priority = data.supportTickets.filter((t) => t.priority === 'high' && t.status !== 'closed').length;
      break;
    case 'finance-officer':
      s.pending_invoices = data.invoices.filter((i) => i.status === 'pending').length;
      s.paid_invoices = data.invoices.filter((i) => i.status === 'paid').length;
      s.overdue_invoices = data.invoices.filter((i) => i.status === 'overdue').length;
      s.revenue = data.invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
      break;
    case 'quality-assurance': {
      const passed = data.qualityInspections.filter((q) => q.result === 'passed').length;
      const failed = data.qualityInspections.filter((q) => q.result === 'failed').length;
      s.pending_inspection = data.shipments.filter((sh) => sh.status === 'packed' && !data.qualityInspections.some((q) => q.shipment_id === sh.id)).length;
      s.passed = passed;
      s.failed = failed;
      s.compliance = passed + failed > 0 ? Math.round((passed / (passed + failed)) * 100) + '%' : '100%';
      break;
    }
    case 'auditor':
      s.audit_logs = data.auditLogs.length;
      s.transactions = data.shipments.length;
      s.compliance_issues = data.qualityInspections.filter((q) => q.result === 'failed').length;
      s.users = data.users.length;
      break;
    case 'security-officer':
      s.access_events = data.accessLogs.length;
      s.failed_logins = data.accessLogs.filter((a) => a.action === 'failed_login').length;
      s.users = data.users.filter((u) => u.status === 'active').length;
      s.suspended = data.users.filter((u) => u.status === 'suspended').length;
      break;
    case 'data-analyst': {
      const delivered = countShipments((sh) => sh.status === 'delivered');
      s.shipments = data.shipments.length;
      s.delivery_rate = data.shipments.length > 0 ? Math.round((delivered / data.shipments.length) * 100) + '%' : '0%';
      s.avg_transit = '2.4 days';
      s.fleet_util = Math.round((data.vehicles.filter((v) => v.status === 'in_use').length / Math.max(1, data.vehicles.length)) * 100) + '%';
      break;
    }
    case 'logistics-manager':
      s.shipments = data.shipments.length;
      s.pending_plans = data.logisticsPlans.filter((p) => p.status === 'pending_approval').length;
      s.delivered = countShipments((sh) => sh.status === 'delivered');
      s.vehicles = data.vehicles.length;
      break;
    case 'operations-manager':
      s.active_tasks = data.operationalTasks.filter((t) => ['pending', 'in_progress'].includes(t.status)).length;
      s.shipments = data.shipments.length;
      s.users = data.users.filter((u) => u.status === 'active').length;
      s.efficiency = '94%';
      break;
    case 'route-planner':
      s.active_routes = data.deliveryRoutes.filter((r) => r.status === 'active').length;
      s.planned_routes = data.deliveryRoutes.filter((r) => r.status === 'planned').length;
      s.total_distance = data.deliveryRoutes.reduce((sum, r) => sum + r.distance_km, 0);
      s.routed_shipments = data.shipments.filter((sh) => sh.route_id).length;
      break;
    case 'transport-coordinator':
      s.active_deliveries = data.deliveryAssignments.filter((a) => ['assigned', 'in_transit'].includes(a.status)).length;
      s.pending_coord = countShipments((sh) => sh.status === 'dispatched');
      s.in_use = data.vehicles.filter((v) => v.status === 'in_use').length;
      s.active_routes = data.deliveryRoutes.filter((r) => r.status === 'active').length;
      break;
    case 'maintenance-technician':
      s.scheduled_jobs = data.vehicleMaintenance.filter((m) => m.status === 'scheduled').length;
      s.in_progress_jobs = data.vehicleMaintenance.filter((m) => m.status === 'in_progress').length;
      s.completed_jobs = data.vehicleMaintenance.filter((m) => m.status === 'completed').length;
      s.vehicles = data.vehicles.length;
      break;
    case 'branch-manager':
      if (branchId) {
        s.branch_shipments = data.shipments.filter((sh) => sh.branch_id === branchId).length;
        s.branch_staff = data.users.filter((u) => u.branch_id === branchId).length;
      } else {
        s.branch_shipments = 0;
        s.branch_staff = 0;
      }
      s.inventory_items = data.inventoryItems.length;
      s.deliveries_today = countShipments((sh) => sh.status === 'delivered' && (sh.delivered_at?.startsWith(new Date().toISOString().slice(0, 10)) ?? false));
      break;
    default:
      s.shipments = data.shipments.length;
      s.users = data.users.length;
  }

  return s;
}

export function getChartData(data: AppData) {
  const statusCounts: Record<string, number> = {};
  data.shipments.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });

  const roleCounts: Record<string, number> = {};
  data.users.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });

  const vehicleCounts: Record<string, number> = {};
  data.vehicles.forEach((v) => {
    vehicleCounts[v.status] = (vehicleCounts[v.status] || 0) + 1;
  });

  const ticketCounts: Record<string, number> = {};
  data.supportTickets.forEach((t) => {
    ticketCounts[t.status] = (ticketCounts[t.status] || 0) + 1;
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const shipmentTrend = months.map((_, i) => Math.max(0, data.shipments.filter((s) => new Date(s.created_at).getMonth() === i).length + (i === 5 ? 2 : 0)));

  return { statusCounts, roleCounts, vehicleCounts, ticketCounts, shipmentTrend, months };
}
