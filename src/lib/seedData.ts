import type { AppData, User } from '@/types';
import type { RoleKey } from '@/types';
import { DEMO_PASSWORD, DEMO_USERS } from '@/config/roles';

/** Demo user IDs — order matches DEMO_USERS / createSeedData user list */
export const UID = {
  superAdmin: 1,
  logisticsManager: 2,
  operationsManager: 3,
  warehouseManager: 4,
  inventoryController: 5,
  dispatcher: 6,
  fleetManager: 7,
  driver: 8,
  deliveryPersonnel: 9,
  procurementOfficer: 10,
  supplierVendor: 11,
  customer: 12,
  customerService: 13,
  routePlanner: 14,
  transportCoordinator: 15,
  qualityAssurance: 16,
  financeOfficer: 17,
  auditor: 18,
  dataAnalyst: 19,
  securityOfficer: 20,
  maintenanceTechnician: 21,
  branchManager: 22,
  shipmentCoordinator: 23,
  packingStaff: 24,
  loadingStaff: 25,
} as const;

function ts(daysAgo = 0, hoursAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

function dateOnly(daysFromNow = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildUsers(): User[] {
  return (Object.entries(DEMO_USERS) as [RoleKey, (typeof DEMO_USERS)[RoleKey]][]).map(([role, data], i) => ({
    id: i + 1,
    full_name: data.full_name,
    email: data.email,
    password: DEMO_PASSWORD,
    role,
    branch_id: data.branch_id,
    phone: data.phone,
    status: 'active',
    created_at: ts(30),
  }));
}

/** Full aligned demo dataset — every role has connected records */
export function createAlignedSeedData(): AppData {
  const users = buildUsers();
  const c = UID.customer;

  const shipments: AppData['shipments'] = [
    { id: 1, tracking_number: 'LMSDEMO001', customer_id: c, origin: 'Manila Warehouse', destination: 'Quezon City Office', description: 'Electronics package', weight_kg: 12, status: 'pending', priority: 'normal', branch_id: 1, coordinator_id: null, route_id: null, estimated_delivery: dateOnly(5), delivered_at: null, created_at: ts(2), updated_at: ts(2) },
    { id: 2, tracking_number: 'LMSDEMO002', customer_id: c, origin: 'Cebu Hub', destination: 'Mandaue Client', description: 'Medical supplies', weight_kg: 5, status: 'approved', priority: 'high', branch_id: 2, coordinator_id: UID.shipmentCoordinator, route_id: 2, estimated_delivery: dateOnly(3), delivered_at: null, created_at: ts(4), updated_at: ts(1) },
    { id: 3, tracking_number: 'LMSDEMO003', customer_id: c, origin: 'Makati Store', destination: 'BGC Tower', description: 'Documents', weight_kg: 2, status: 'packed', priority: 'urgent', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: 1, estimated_delivery: dateOnly(2), delivered_at: null, created_at: ts(5), updated_at: ts(1) },
    { id: 4, tracking_number: 'LMSDEMO004', customer_id: c, origin: 'Pasig Depot', destination: 'Ortigas Center', description: 'Office furniture parts', weight_kg: 45, status: 'loaded', priority: 'normal', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: 1, estimated_delivery: dateOnly(1), delivered_at: null, created_at: ts(6), updated_at: ts(0, 12) },
    { id: 5, tracking_number: 'LMSDEMO005', customer_id: c, origin: 'Manila Port', destination: 'Caloocan Warehouse', description: 'Industrial tools', weight_kg: 80, status: 'in_transit', priority: 'high', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: 1, estimated_delivery: dateOnly(0), delivered_at: null, created_at: ts(7), updated_at: ts(0, 6) },
    { id: 6, tracking_number: 'LMSDEMO006', customer_id: c, origin: 'Taguig Hub', destination: 'Alabang Office', description: 'Computer peripherals', weight_kg: 8, status: 'delivered', priority: 'normal', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: 1, estimated_delivery: dateOnly(-2), delivered_at: ts(1), created_at: ts(10), updated_at: ts(1) },
    { id: 7, tracking_number: 'LMSDEMO007', customer_id: c, origin: 'Quezon City', destination: 'Marikina', description: 'Fragile glassware', weight_kg: 15, status: 'issue', priority: 'urgent', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: null, estimated_delivery: dateOnly(4), delivered_at: null, created_at: ts(3), updated_at: ts(1) },
    { id: 8, tracking_number: 'LMSDEMO008', customer_id: c, origin: 'Valenzuela DC', destination: 'Malabon Retail', description: 'Retail stock replenishment', weight_kg: 120, status: 'processing', priority: 'normal', branch_id: 1, coordinator_id: UID.shipmentCoordinator, route_id: null, estimated_delivery: dateOnly(6), delivered_at: null, created_at: ts(1), updated_at: ts(0, 3) },
    { id: 9, tracking_number: 'LMSDEMO009', customer_id: c, origin: 'Cebu City', destination: 'Lapu-Lapu Resort', description: 'Hospitality supplies', weight_kg: 25, status: 'out_for_delivery', priority: 'high', branch_id: 2, coordinator_id: UID.shipmentCoordinator, route_id: 2, estimated_delivery: dateOnly(0), delivered_at: null, created_at: ts(8), updated_at: ts(0, 2) },
    { id: 10, tracking_number: 'LMSDEMO010', customer_id: c, origin: 'Baguio Branch', destination: 'La Trinidad', description: 'Agricultural equipment', weight_kg: 200, status: 'delivered', priority: 'normal', branch_id: 3, coordinator_id: UID.shipmentCoordinator, route_id: 3, estimated_delivery: dateOnly(-5), delivered_at: ts(5), created_at: ts(14), updated_at: ts(5) },
    { id: 11, tracking_number: 'LMSDEMO011', customer_id: c, origin: 'Cebu Hub', destination: 'Danao City', description: 'Spare parts shipment', weight_kg: 35, status: 'dispatched', priority: 'normal', branch_id: 2, coordinator_id: UID.shipmentCoordinator, route_id: 2, estimated_delivery: dateOnly(1), delivered_at: null, created_at: ts(6), updated_at: ts(0, 4) },
  ];

  const shipmentStatusLogs: AppData['shipmentStatusLogs'] = [
    { id: 1, shipment_id: 1, status: 'pending', notes: 'Customer submitted request', updated_by: c, created_at: ts(2) },
    { id: 2, shipment_id: 2, status: 'pending', notes: 'Submitted', updated_by: c, created_at: ts(4) },
    { id: 3, shipment_id: 2, status: 'approved', notes: 'Approved for packing', updated_by: UID.shipmentCoordinator, created_at: ts(1) },
    { id: 4, shipment_id: 3, status: 'pending', notes: 'Submitted', updated_by: c, created_at: ts(5) },
    { id: 5, shipment_id: 3, status: 'approved', notes: 'Approved', updated_by: UID.shipmentCoordinator, created_at: ts(3) },
    { id: 6, shipment_id: 3, status: 'packed', notes: 'Packed by Betty Gonzales', updated_by: UID.packingStaff, created_at: ts(1) },
    { id: 7, shipment_id: 4, status: 'packed', notes: 'Packed and QA cleared', updated_by: UID.packingStaff, created_at: ts(2) },
    { id: 8, shipment_id: 4, status: 'loaded', notes: 'Loaded onto truck ABC-1234', updated_by: UID.loadingStaff, created_at: ts(0, 12) },
    { id: 9, shipment_id: 5, status: 'loaded', notes: 'Loaded for Metro Manila run', updated_by: UID.loadingStaff, created_at: ts(1) },
    { id: 10, shipment_id: 5, status: 'in_transit', notes: 'Driver Juan Dela Cruz en route', updated_by: UID.driver, created_at: ts(0, 6) },
    { id: 11, shipment_id: 6, status: 'delivered', notes: 'Delivered with POD signature', updated_by: UID.driver, created_at: ts(1) },
    { id: 12, shipment_id: 7, status: 'issue', notes: 'Damaged packaging reported at intake', updated_by: UID.shipmentCoordinator, created_at: ts(1) },
    { id: 13, shipment_id: 8, status: 'processing', notes: 'Coordinator started processing', updated_by: UID.shipmentCoordinator, created_at: ts(0, 3) },
    { id: 14, shipment_id: 9, status: 'out_for_delivery', notes: 'Courier Anna Torres on last mile', updated_by: UID.deliveryPersonnel, created_at: ts(0, 2) },
    { id: 15, shipment_id: 10, status: 'delivered', notes: 'Delivered to La Trinidad', updated_by: UID.deliveryPersonnel, created_at: ts(5) },
    { id: 16, shipment_id: 11, status: 'dispatched', notes: 'Dispatched from Cebu Hub', updated_by: UID.dispatcher, created_at: ts(0, 4) },
  ];

  const packingRecords: AppData['packingRecords'] = [
    { id: 1, shipment_id: 3, packer_id: UID.packingStaff, verified: false, packed_at: ts(1) },
    { id: 2, shipment_id: 4, packer_id: UID.packingStaff, verified: true, packed_at: ts(2) },
    { id: 3, shipment_id: 5, packer_id: UID.packingStaff, verified: true, packed_at: ts(2) },
  ];

  const qualityInspections: AppData['qualityInspections'] = [
    { id: 1, shipment_id: 3, inspector_id: UID.qualityAssurance, result: 'passed', inspected_at: ts(1) },
    { id: 2, shipment_id: 4, inspector_id: UID.qualityAssurance, result: 'passed', inspected_at: ts(2) },
    { id: 3, shipment_id: 5, inspector_id: UID.qualityAssurance, result: 'passed', inspected_at: ts(2) },
    { id: 4, shipment_id: 7, inspector_id: UID.qualityAssurance, result: 'failed', damage_report: 'Outer carton crushed — repack required', inspected_at: ts(1) },
  ];

  const loadingRecords: AppData['loadingRecords'] = [
    { id: 1, shipment_id: 4, staff_id: UID.loadingStaff, action_type: 'load', condition_status: 'good', recorded_at: ts(0, 12) },
    { id: 2, shipment_id: 5, staff_id: UID.loadingStaff, action_type: 'load', condition_status: 'good', recorded_at: ts(1) },
    { id: 3, shipment_id: 6, staff_id: UID.loadingStaff, action_type: 'unload', condition_status: 'good', recorded_at: ts(1) },
    { id: 4, shipment_id: 7, staff_id: UID.loadingStaff, action_type: 'load', condition_status: 'damaged', damage_notes: 'Visible dents on corner', recorded_at: ts(2) },
  ];

  const deliveryAssignments: AppData['deliveryAssignments'] = [
    { id: 1, shipment_id: 5, driver_id: UID.driver, vehicle_id: 2, dispatcher_id: UID.dispatcher, route_id: 1, status: 'in_transit', assigned_at: ts(0, 8) },
    { id: 2, shipment_id: 6, driver_id: UID.driver, vehicle_id: 2, dispatcher_id: UID.dispatcher, route_id: 1, status: 'delivered', assigned_at: ts(3) },
    { id: 3, shipment_id: 9, driver_id: UID.deliveryPersonnel, vehicle_id: 3, dispatcher_id: UID.dispatcher, route_id: 2, status: 'in_transit', assigned_at: ts(0, 4) },
    { id: 4, shipment_id: 10, driver_id: UID.deliveryPersonnel, vehicle_id: 3, dispatcher_id: UID.dispatcher, route_id: 3, status: 'delivered', assigned_at: ts(6) },
    { id: 5, shipment_id: 11, driver_id: UID.deliveryPersonnel, vehicle_id: 3, dispatcher_id: UID.dispatcher, route_id: 2, status: 'assigned', assigned_at: ts(0, 3) },
    { id: 6, shipment_id: 4, driver_id: UID.driver, vehicle_id: 1, dispatcher_id: UID.dispatcher, route_id: 1, status: 'assigned', assigned_at: ts(0, 10) },
  ];

  const invoices: AppData['invoices'] = [
    { id: 1, invoice_number: 'INV-2026-0001', shipment_id: 6, customer_id: c, amount: 1900, status: 'paid', due_date: dateOnly(-5), paid_at: ts(1), created_at: ts(2) },
    { id: 2, invoice_number: 'INV-2026-0002', shipment_id: 10, customer_id: c, amount: 11500, status: 'pending', due_date: dateOnly(7), paid_at: null, created_at: ts(4) },
    { id: 3, invoice_number: 'INV-2026-0003', shipment_id: null, customer_id: c, amount: 4500, status: 'overdue', due_date: dateOnly(-10), paid_at: null, created_at: ts(20) },
  ];

  const purchaseOrders: AppData['purchaseOrders'] = [
    { id: 1, po_number: 'PO-2026-001', procurement_officer_id: UID.procurementOfficer, supplier_id: UID.supplierVendor, total_amount: 25000, status: 'sent', expected_delivery: dateOnly(10), created_at: ts(5) },
    { id: 2, po_number: 'PO-2026-002', procurement_officer_id: UID.procurementOfficer, supplier_id: UID.supplierVendor, total_amount: 18500, status: 'confirmed', expected_delivery: dateOnly(8), created_at: ts(8) },
    { id: 3, po_number: 'PO-2026-003', procurement_officer_id: UID.procurementOfficer, supplier_id: UID.supplierVendor, total_amount: 42000, status: 'shipped', expected_delivery: dateOnly(3), created_at: ts(12) },
    { id: 4, po_number: 'PO-2026-004', procurement_officer_id: UID.procurementOfficer, supplier_id: UID.supplierVendor, total_amount: 9800, status: 'received', expected_delivery: dateOnly(-3), created_at: ts(20) },
    { id: 5, po_number: 'PO-2026-005', procurement_officer_id: UID.procurementOfficer, supplier_id: UID.supplierVendor, total_amount: 15000, status: 'draft', expected_delivery: dateOnly(14), created_at: ts(1) },
  ];

  const stockMovements: AppData['stockMovements'] = [
    { id: 1, item_id: 3, movement_type: 'transfer', quantity: 50, from_location: 'A-03', to_location: 'C-01', reference: 'LMSDEMO003', status: 'pending', requested_by: UID.inventoryController, approved_by: null, notes: 'Transfer tape to packing station', created_at: ts(1) },
    { id: 2, item_id: 1, movement_type: 'out', quantity: 20, from_location: 'A-01', to_location: 'Packing Bay', reference: 'LMSDEMO002', status: 'pending', requested_by: UID.inventoryController, approved_by: null, created_at: ts(0, 6) },
    { id: 3, item_id: 2, movement_type: 'in', quantity: 100, from_location: 'Supplier', to_location: 'A-02', reference: 'PO-2026-004', status: 'completed', requested_by: UID.warehouseManager, approved_by: UID.warehouseManager, notes: 'PO-2026-004 received', created_at: ts(3) },
    { id: 4, item_id: 5, movement_type: 'adjustment', quantity: -5, from_location: 'C-02', to_location: 'C-02', reference: 'AUDIT-Q2', status: 'approved', requested_by: UID.inventoryController, approved_by: UID.warehouseManager, created_at: ts(2) },
  ];

  const supportTickets: AppData['supportTickets'] = [
    { id: 1, ticket_number: 'TKT-00001', customer_id: c, subject: 'Delayed shipment inquiry', description: 'Please check status of LMSDEMO001 — expected update today.', status: 'open', priority: 'normal', assigned_to: null, resolved_at: null, created_at: ts(1) },
    { id: 2, ticket_number: 'TKT-00002', customer_id: c, subject: 'In-transit update for LMSDEMO005', description: 'Need ETA for industrial tools shipment.', status: 'in_progress', priority: 'high', assigned_to: UID.customerService, resolved_at: null, created_at: ts(0, 8) },
    { id: 3, ticket_number: 'TKT-00003', customer_id: c, subject: 'Invoice question', description: 'Clarify charges on INV-2026-0002', status: 'resolved', priority: 'normal', assigned_to: UID.customerService, resolved_at: ts(0, 2), created_at: ts(2) },
    { id: 4, ticket_number: 'TKT-00004', customer_id: c, subject: 'Damaged goods LMSDEMO007', description: 'Reported damage — need replacement timeline.', status: 'open', priority: 'high', assigned_to: null, resolved_at: null, created_at: ts(0, 4) },
  ];

  const notifications: AppData['notifications'] = [
    { id: 1, user_id: c, title: 'Shipment Approved', message: 'LMSDEMO002 has been approved and queued for packing.', type: 'success', link: '/customer/track?tracking=LMSDEMO002', is_read: false, created_at: ts(1) },
    { id: 2, user_id: c, title: 'Out for Delivery', message: 'LMSDEMO009 is out for delivery with courier Anna Torres.', type: 'info', link: '/customer/track?tracking=LMSDEMO009', is_read: false, created_at: ts(0, 2) },
    { id: 3, user_id: c, title: 'Delivery Complete', message: 'LMSDEMO006 was delivered successfully.', type: 'success', is_read: true, created_at: ts(1) },
    { id: 4, user_id: UID.packingStaff, title: 'New Pack Queue', message: 'LMSDEMO002 is ready for packing.', type: 'info', is_read: false, created_at: ts(1) },
    { id: 5, user_id: UID.dispatcher, title: 'Ready to Dispatch', message: 'LMSDEMO004 loaded — assign driver and vehicle.', type: 'warning', is_read: false, created_at: ts(0, 10) },
    { id: 6, user_id: UID.financeOfficer, title: 'Invoice Pending', message: 'INV-2026-0002 awaiting payment from Michael Garcia.', type: 'info', is_read: false, created_at: ts(4) },
    { id: 7, user_id: UID.warehouseManager, title: 'Movement Approval', message: '2 stock transfers pending your approval.', type: 'warning', is_read: false, created_at: ts(1) },
  ];

  const auditLogs: AppData['auditLogs'] = [
    { id: 1, user_id: UID.shipmentCoordinator, action: 'approve_shipment', entity_type: 'shipment', entity_id: 2, details: 'Approved LMSDEMO002', created_at: ts(1) },
    { id: 2, user_id: UID.packingStaff, action: 'pack_shipment', entity_type: 'shipment', entity_id: 3, details: 'Packed LMSDEMO003', created_at: ts(1) },
    { id: 3, user_id: UID.qualityAssurance, action: 'inspect_shipment', entity_type: 'shipment', entity_id: 4, details: 'QA passed LMSDEMO004', created_at: ts(2) },
    { id: 4, user_id: UID.dispatcher, action: 'assign_delivery', entity_type: 'delivery_assignment', entity_id: 1, details: 'Assigned Juan Dela Cruz to LMSDEMO005', created_at: ts(0, 8) },
    { id: 5, user_id: UID.financeOfficer, action: 'pay_invoice', entity_type: 'invoice', entity_id: 1, details: 'Marked INV-2026-0001 paid', created_at: ts(1) },
    { id: 6, user_id: UID.procurementOfficer, action: 'create_po', entity_type: 'purchase_order', entity_id: 1, details: 'Created PO-2026-001', created_at: ts(5) },
    { id: 7, user_id: UID.superAdmin, action: 'system_backup', entity_type: 'system', entity_id: null, details: 'Demo data initialized', created_at: ts(30) },
    { id: 8, user_id: UID.auditor, action: 'review_compliance', entity_type: 'quality_inspection', entity_id: 4, details: 'Reviewed failed QA on LMSDEMO007', created_at: ts(1) },
  ];

  const crudRecords: AppData['crudRecords'] = [
    { id: 1, user_id: UID.customer, user_role: 'customer', operation: 'create', entity_type: 'shipment', entity_id: 1, record_label: 'LMSDEMO001', details: 'Manila Warehouse → Quezon City Office', created_at: ts(2) },
    { id: 2, user_id: UID.shipmentCoordinator, user_role: 'shipment-coordinator', operation: 'update', entity_type: 'shipment', entity_id: 2, record_label: 'LMSDEMO002', details: 'Status → approved', created_at: ts(1) },
    { id: 3, user_id: UID.packingStaff, user_role: 'packing-staff', operation: 'update', entity_type: 'shipment', entity_id: 3, record_label: 'LMSDEMO003', details: 'Marked as packed', created_at: ts(1) },
    { id: 4, user_id: UID.qualityAssurance, user_role: 'quality-assurance', operation: 'update', entity_type: 'shipment', entity_id: 4, record_label: 'LMSDEMO004', details: 'QA passed', created_at: ts(2) },
    { id: 5, user_id: UID.loadingStaff, user_role: 'loading-unloading-staff', operation: 'update', entity_type: 'shipment', entity_id: 4, record_label: 'LMSDEMO004', details: 'Cargo loaded', created_at: ts(0, 12) },
    { id: 6, user_id: UID.dispatcher, user_role: 'dispatcher', operation: 'create', entity_type: 'delivery_assignment', entity_id: 1, record_label: 'LMSDEMO005', details: 'Driver Juan Dela Cruz assigned', created_at: ts(0, 8) },
    { id: 7, user_id: UID.driver, user_role: 'driver', operation: 'update', entity_type: 'delivery_assignment', entity_id: 1, record_label: 'LMSDEMO005', details: 'Status → in_transit', created_at: ts(0, 6) },
    { id: 8, user_id: UID.financeOfficer, user_role: 'finance-officer', operation: 'create', entity_type: 'invoice', entity_id: 1, record_label: 'INV-2026-0001', details: 'LMSDEMO006 — ₱1,900.00', created_at: ts(2) },
    { id: 9, user_id: UID.financeOfficer, user_role: 'finance-officer', operation: 'update', entity_type: 'invoice', entity_id: 1, record_label: 'INV-2026-0001', details: 'Marked as paid', created_at: ts(1) },
    { id: 10, user_id: UID.procurementOfficer, user_role: 'procurement-officer', operation: 'create', entity_type: 'purchase_order', entity_id: 1, record_label: 'PO-2026-001', details: '₱25,000.00', created_at: ts(5) },
    { id: 11, user_id: UID.supplierVendor, user_role: 'supplier-vendor', operation: 'update', entity_type: 'purchase_order', entity_id: 2, record_label: 'PO-2026-002', details: 'Status → confirmed', created_at: ts(4) },
    { id: 12, user_id: UID.inventoryController, user_role: 'inventory-controller', operation: 'create', entity_type: 'stock_movement', entity_id: 1, record_label: 'PKG-003', details: 'transfer × 50', created_at: ts(1) },
    { id: 13, user_id: UID.customerService, user_role: 'customer-service', operation: 'update', entity_type: 'support_ticket', entity_id: 3, record_label: 'TKT-00003', details: 'Resolved', created_at: ts(0, 2) },
    { id: 14, user_id: UID.fleetManager, user_role: 'fleet-manager', operation: 'create', entity_type: 'fuel_log', entity_id: 1, record_label: 'ABC-1234', details: '45L — ₱2,925.00', created_at: ts(3) },
    { id: 15, user_id: UID.maintenanceTechnician, user_role: 'maintenance-technician', operation: 'create', entity_type: 'maintenance', entity_id: 1, record_label: 'ABC-1234', details: 'Oil Change', created_at: ts(5) },
    { id: 16, user_id: UID.routePlanner, user_role: 'route-planner', operation: 'create', entity_type: 'delivery_route', entity_id: 1, record_label: 'Metro Manila Loop', details: '45 km', created_at: ts(20) },
    { id: 17, user_id: UID.operationsManager, user_role: 'operations-manager', operation: 'create', entity_type: 'task', entity_id: 1, record_label: 'Review morning dispatch queue', details: 'Assigned to dispatcher', created_at: ts(0, 10) },
    { id: 18, user_id: UID.logisticsManager, user_role: 'logistics-manager', operation: 'update', entity_type: 'logistics_plan', entity_id: 2, record_label: 'Cebu Island Network', details: 'Approved', created_at: ts(15) },
    { id: 19, user_id: UID.qualityAssurance, user_role: 'quality-assurance', operation: 'update', entity_type: 'shipment', entity_id: 7, record_label: 'LMSDEMO007', details: 'QA failed', created_at: ts(1) },
    { id: 20, user_id: UID.superAdmin, user_role: 'super-admin', operation: 'create', entity_type: 'system_backup', entity_id: null, record_label: 'lms-backup.json', details: 'Demo data initialized', created_at: ts(30) },
  ];

  const accessLogs: AppData['accessLogs'] = [
    { id: 1, user_id: UID.superAdmin, email: 'lms.superadmin@gmail.com', action: 'login', ip_address: '192.168.1.10', created_at: ts(0, 1) },
    { id: 2, user_id: UID.customer, email: 'lms.customer@gmail.com', action: 'login', ip_address: '203.177.45.22', created_at: ts(0, 3) },
    { id: 3, user_id: UID.dispatcher, email: 'lms.dispatcher@gmail.com', action: 'login', ip_address: '192.168.1.25', created_at: ts(0, 5) },
    { id: 4, user_id: null, email: 'unknown@test.com', action: 'failed_login', ip_address: '45.33.12.88', created_at: ts(0, 8) },
    { id: 5, user_id: UID.driver, email: 'lms.driver@gmail.com', action: 'login', ip_address: '10.0.0.55', created_at: ts(0, 2) },
    { id: 6, user_id: UID.financeOfficer, email: 'lms.finance@gmail.com', action: 'login', ip_address: '192.168.1.40', created_at: ts(1) },
  ];

  const operationalTasks: AppData['operationalTasks'] = [
    { id: 1, title: 'Review morning dispatch queue', description: 'Check all pending shipments at Main Hub', assigned_to: UID.dispatcher, assigned_by: UID.operationsManager, status: 'pending', due_date: today(), created_at: ts(0, 10) },
    { id: 2, title: 'Cebu branch inventory audit', description: 'Verify South Branch stock counts', assigned_to: UID.inventoryController, assigned_by: UID.operationsManager, status: 'in_progress', due_date: dateOnly(2), created_at: ts(2) },
    { id: 3, title: 'Update route efficiency report', description: 'Compile Q2 route performance', assigned_to: UID.routePlanner, assigned_by: UID.logisticsManager, status: 'completed', due_date: dateOnly(-1), created_at: ts(5) },
    { id: 4, title: 'Coordinate LMSDEMO011 dispatch', description: 'Assign vehicle for Cebu outbound', assigned_to: UID.transportCoordinator, assigned_by: UID.operationsManager, status: 'pending', due_date: today(), created_at: ts(0, 4) },
  ];

  const logisticsPlans: AppData['logisticsPlans'] = [
    { id: 1, title: 'Q2 Metro Expansion', description: 'Expand delivery coverage to NCR satellite cities', created_by: UID.logisticsManager, approved_by: null, status: 'pending_approval', created_at: ts(7) },
    { id: 2, title: 'Cebu Island Network', description: 'Link Cebu, Mandaue, and Lapu-Lapu hubs', created_by: UID.logisticsManager, approved_by: UID.logisticsManager, status: 'approved', created_at: ts(20) },
    { id: 3, title: 'Cold Chain Pilot', description: 'Temperature-controlled delivery for medical supplies', created_by: UID.logisticsManager, approved_by: null, status: 'draft', created_at: ts(3) },
  ];

  const vehicleMaintenance: AppData['vehicleMaintenance'] = [
    { id: 1, vehicle_id: 1, technician_id: UID.maintenanceTechnician, type: 'Oil Change', description: 'Routine 10k km service', cost: 3500, status: 'scheduled', scheduled_date: dateOnly(5) },
    { id: 2, vehicle_id: 4, technician_id: UID.maintenanceTechnician, type: 'Brake Inspection', description: 'Front brake pads worn', cost: 8500, status: 'in_progress', scheduled_date: today() },
    { id: 3, vehicle_id: 2, technician_id: UID.maintenanceTechnician, type: 'Tire Rotation', description: 'Completed rotation', cost: 1200, status: 'completed', scheduled_date: dateOnly(-7) },
  ];

  const fuelLogs: AppData['fuelLogs'] = [
    { id: 1, vehicle_id: 1, liters: 45, cost: 2925, odometer: 125000, logged_by: UID.fleetManager, logged_at: ts(3) },
    { id: 2, vehicle_id: 2, liters: 38, cost: 2470, odometer: 89000, logged_by: UID.fleetManager, logged_at: ts(1) },
    { id: 3, vehicle_id: 3, liters: 12, cost: 780, odometer: 45000, logged_by: UID.fleetManager, logged_at: ts(0, 6) },
    { id: 4, vehicle_id: 5, liters: 55, cost: 3575, odometer: 210000, logged_by: UID.fleetManager, logged_at: ts(2) },
  ];

  return {
    branches: [
      { id: 1, name: 'Main Hub', location: 'Manila, Philippines', phone: '+63-2-8888-0001', status: 'active' },
      { id: 2, name: 'South Branch', location: 'Cebu, Philippines', phone: '+63-32-8888-0002', status: 'active' },
      { id: 3, name: 'North Branch', location: 'Baguio, Philippines', phone: '+63-74-8888-0003', status: 'active' },
    ],
    users,
    shipments,
    shipmentStatusLogs,
    inventoryItems: [
      { id: 1, sku: 'PKG-001', name: 'Standard Carton Box', quantity: 480, min_quantity: 100, warehouse_location: 'A-01', branch_id: 1, status: 'available' },
      { id: 2, sku: 'PKG-002', name: 'Bubble Wrap Roll', quantity: 180, min_quantity: 50, warehouse_location: 'A-02', branch_id: 1, status: 'available' },
      { id: 3, sku: 'PKG-003', name: 'Packing Tape', quantity: 15, min_quantity: 20, warehouse_location: 'A-03', branch_id: 1, status: 'low_stock' },
      { id: 4, sku: 'LBL-001', name: 'Shipping Labels', quantity: 950, min_quantity: 200, warehouse_location: 'B-01', branch_id: 1, status: 'available' },
      { id: 5, sku: 'PKG-004', name: 'Cold Chain Insulated Box', quantity: 45, min_quantity: 30, warehouse_location: 'C-02', branch_id: 1, status: 'available' },
      { id: 6, sku: 'CEB-001', name: 'Cebu Hub Cartons', quantity: 220, min_quantity: 80, warehouse_location: 'CEB-A1', branch_id: 2, status: 'available' },
      { id: 7, sku: 'CEB-002', name: 'Island Route Fuel Cards', quantity: 8, min_quantity: 10, warehouse_location: 'CEB-B1', branch_id: 2, status: 'low_stock' },
    ],
    stockMovements,
    vehicles: [
      { id: 1, plate_number: 'ABC-1234', model: 'Isuzu N-Series', type: 'truck', capacity_kg: 5000, fuel_level: 72, status: 'in_use', branch_id: 1, assigned_driver_id: UID.driver, last_maintenance: '2026-04-15' },
      { id: 2, plate_number: 'XYZ-5678', model: 'Toyota HiAce', type: 'van', capacity_kg: 1500, fuel_level: 65, status: 'in_use', branch_id: 1, assigned_driver_id: UID.driver, last_maintenance: '2026-05-01' },
      { id: 3, plate_number: 'MNL-9012', model: 'Honda Beat', type: 'motorcycle', capacity_kg: 50, fuel_level: 88, status: 'in_use', branch_id: 2, assigned_driver_id: UID.deliveryPersonnel, last_maintenance: '2026-05-10' },
      { id: 4, plate_number: 'CEB-3344', model: 'Fuso Canter', type: 'truck', capacity_kg: 3500, fuel_level: 40, status: 'maintenance', branch_id: 2, assigned_driver_id: null, last_maintenance: '2026-05-28' },
      { id: 5, plate_number: 'BGO-7788', model: 'Isuzu Forward', type: 'truck', capacity_kg: 8000, fuel_level: 90, status: 'available', branch_id: 3, assigned_driver_id: null, last_maintenance: '2026-04-20' },
    ],
    deliveryRoutes: [
      { id: 1, route_name: 'Metro Manila Loop', waypoints: 'Manila → Quezon City → Makati → BGC', distance_km: 45, status: 'active', planner_id: UID.routePlanner },
      { id: 2, route_name: 'Cebu Express', waypoints: 'Cebu City → Mandaue → Lapu-Lapu', distance_km: 32, status: 'active', planner_id: UID.routePlanner },
      { id: 3, route_name: 'Baguio Highlands', waypoints: 'Baguio → La Trinidad → Itogon', distance_km: 58, status: 'planned', planner_id: UID.routePlanner },
      { id: 4, route_name: 'NCR South Corridor', waypoints: 'Makati → Alabang → Laguna', distance_km: 52, status: 'planned', planner_id: UID.routePlanner },
    ],
    deliveryAssignments,
    purchaseOrders,
    invoices,
    supportTickets,
    notifications,
    auditLogs,
    crudRecords,
    accessLogs,
    operationalTasks,
    logisticsPlans,
    qualityInspections,
    packingRecords,
    loadingRecords,
    vehicleMaintenance,
    fuelLogs,
    nextId: {
      shipments: 12,
      shipmentStatusLogs: 17,
      stockMovements: 5,
      deliveryAssignments: 7,
      purchaseOrders: 6,
      invoices: 4,
      supportTickets: 5,
      notifications: 8,
      auditLogs: 9,
      crudRecords: 21,
      accessLogs: 7,
      operationalTasks: 5,
      logisticsPlans: 4,
      qualityInspections: 5,
      packingRecords: 4,
      loadingRecords: 5,
      vehicleMaintenance: 4,
      fuelLogs: 5,
      deliveryRoutes: 5,
      users: 26,
    },
  };
}
