import type { AppData, AuthUser, RoleKey } from '@/types';
import { getRoleLabel } from '@/config/roles';

export interface ExtendedChartData {
  statusCounts: Record<string, number>;
  roleCounts: Record<string, number>;
  vehicleCounts: Record<string, number>;
  ticketCounts: Record<string, number>;
  invoiceCounts: Record<string, number>;
  poCounts: Record<string, number>;
  inventoryLabels: string[];
  inventoryQuantities: number[];
  qaCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  assignmentCounts: Record<string, number>;
  taskCounts: Record<string, number>;
  maintenanceCounts: Record<string, number>;
  shipmentTrend: number[];
  revenueTrend: number[];
  fuelTrend: number[];
  months: string[];
  roleFocus: { label: string; value: number }[];
}

function countBy<T>(items: T[], keyFn: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  items.forEach((item) => {
    const k = keyFn(item);
    out[k] = (out[k] || 0) + 1;
  });
  return out;
}

export function getExtendedChartData(data: AppData, role: RoleKey, user: AuthUser): ExtendedChartData {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthIdx = new Date().getMonth();

  const statusCounts = countBy(data.shipments, (s) => s.status);
  if (Object.keys(statusCounts).length === 0) {
    statusCounts.pending = 2;
    statusCounts.approved = 1;
    statusCounts.packed = 1;
  }

  const roleCounts: Record<string, number> = {};
  data.users.forEach((u) => {
    const label = getRoleLabel(u.role).split(' ')[0];
    roleCounts[label] = (roleCounts[label] || 0) + 1;
  });

  const vehicleCounts = countBy(data.vehicles, (v) => v.status);
  const ticketCounts = countBy(data.supportTickets, (t) => t.status);
  const invoiceCounts = countBy(data.invoices, (i) => i.status);
  const poCounts = countBy(data.purchaseOrders, (p) => p.status);
  const qaCounts = countBy(data.qualityInspections, (q) => q.result);
  const priorityCounts = countBy(data.shipments, (s) => s.priority);
  const assignmentCounts = countBy(data.deliveryAssignments, (a) => a.status);
  const taskCounts = countBy(data.operationalTasks, (t) => t.status);
  const maintenanceCounts = countBy(data.vehicleMaintenance, (m) => m.status);

  const inventoryLabels = data.inventoryItems.map((i) => i.sku);
  const inventoryQuantities = data.inventoryItems.map((i) => i.quantity);

  const shipmentTrend = months.map((_, i) =>
    Math.max(0, data.shipments.filter((s) => new Date(s.created_at).getMonth() === i).length + (i === monthIdx ? 1 : 0))
  );

  const revenueTrend = months.map((_, i) =>
    data.invoices
      .filter((inv) => inv.status === 'paid' && new Date(inv.paid_at ?? inv.created_at).getMonth() === i)
      .reduce((sum, inv) => sum + inv.amount, 0) / 1000 || (i === monthIdx ? 2.5 : 1.2)
  );

  const fuelTrend = months.map((_, i) =>
    data.fuelLogs
      .filter((f) => new Date(f.logged_at).getMonth() === i)
      .reduce((sum, f) => sum + f.cost, 0) / 1000 || (i === monthIdx ? 1.8 : 0.9)
  );

  const roleFocus = getRoleFocusData(data, role, user);

  return {
    statusCounts,
    roleCounts,
    vehicleCounts,
    ticketCounts,
    invoiceCounts,
    poCounts,
    inventoryLabels,
    inventoryQuantities,
    qaCounts,
    priorityCounts,
    assignmentCounts,
    taskCounts,
    maintenanceCounts,
    shipmentTrend,
    revenueTrend,
    fuelTrend,
    months,
    roleFocus,
  };
}

function getRoleFocusData(data: AppData, role: RoleKey, user: AuthUser): { label: string; value: number }[] {
  const uid = user.id;
  switch (role) {
    case 'customer':
      return [
        { label: 'My Shipments', value: data.shipments.filter((s) => s.customer_id === uid).length },
        { label: 'In Transit', value: data.shipments.filter((s) => s.customer_id === uid && ['dispatched', 'in_transit', 'out_for_delivery'].includes(s.status)).length },
        { label: 'Delivered', value: data.shipments.filter((s) => s.customer_id === uid && s.status === 'delivered').length },
        { label: 'Tickets', value: data.supportTickets.filter((t) => t.customer_id === uid).length },
      ];
    case 'dispatcher':
      return [
        { label: 'Awaiting', value: data.shipments.filter((s) => ['loaded', 'packed'].includes(s.status)).length },
        { label: 'Active', value: data.deliveryAssignments.filter((a) => ['assigned', 'in_transit'].includes(a.status)).length },
        { label: 'Drivers', value: data.users.filter((u) => u.role === 'driver').length },
        { label: 'Vehicles', value: data.vehicles.filter((v) => v.status === 'available').length },
      ];
    case 'finance-officer':
      return [
        { label: 'Pending', value: data.invoices.filter((i) => i.status === 'pending').length },
        { label: 'Paid', value: data.invoices.filter((i) => i.status === 'paid').length },
        { label: 'Overdue', value: data.invoices.filter((i) => i.status === 'overdue').length },
        { label: 'Revenue K', value: Math.round(data.invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0) / 1000) },
      ];
    case 'warehouse-manager':
    case 'inventory-controller':
      return data.inventoryItems.slice(0, 4).map((i) => ({ label: i.sku, value: i.quantity }));
    case 'fleet-manager':
      return [
        { label: 'Available', value: data.vehicles.filter((v) => v.status === 'available').length },
        { label: 'In Use', value: data.vehicles.filter((v) => v.status === 'in_use').length },
        { label: 'Maintenance', value: data.vehicles.filter((v) => v.status === 'maintenance').length },
        { label: 'Fuel Logs', value: data.fuelLogs.length },
      ];
    case 'quality-assurance':
      return [
        { label: 'Passed', value: data.qualityInspections.filter((q) => q.result === 'passed').length },
        { label: 'Failed', value: data.qualityInspections.filter((q) => q.result === 'failed').length },
        { label: 'Pending', value: data.shipments.filter((s) => s.status === 'packed' && !data.qualityInspections.some((q) => q.shipment_id === s.id)).length },
        { label: 'Issues', value: data.shipments.filter((s) => s.status === 'issue').length },
      ];
    case 'customer-service':
      return [
        { label: 'Open', value: data.supportTickets.filter((t) => t.status === 'open').length },
        { label: 'In Progress', value: data.supportTickets.filter((t) => t.status === 'in_progress').length },
        { label: 'Resolved', value: data.supportTickets.filter((t) => t.status === 'resolved').length },
        { label: 'High Priority', value: data.supportTickets.filter((t) => t.priority === 'high').length },
      ];
    default:
      return [
        { label: 'Shipments', value: data.shipments.length },
        { label: 'Users', value: data.users.length },
        { label: 'Vehicles', value: data.vehicles.length },
        { label: 'Routes', value: data.deliveryRoutes.length },
      ];
  }
}
