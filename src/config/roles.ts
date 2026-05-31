import type { RoleKey, RolePages, StatDef } from '@/types';

export interface RoleConfig {
  label: string;
  folder: string;
  icon: string;
  registerable: boolean;
}

export const ROLES: Record<RoleKey, RoleConfig> = {
  'super-admin': { label: 'Super Admin', folder: 'super-admin', icon: '🛡️', registerable: false },
  'logistics-manager': { label: 'Logistics Manager', folder: 'logistics-manager', icon: '🚚', registerable: true },
  'operations-manager': { label: 'Operations Manager', folder: 'operations-manager', icon: '⚙️', registerable: true },
  'warehouse-manager': { label: 'Warehouse Manager', folder: 'warehouse-manager', icon: '🏬', registerable: true },
  'inventory-controller': { label: 'Inventory Controller', folder: 'inventory-controller', icon: '📦', registerable: true },
  dispatcher: { label: 'Dispatcher', folder: 'dispatcher', icon: '📡', registerable: true },
  'fleet-manager': { label: 'Fleet Manager', folder: 'fleet-manager', icon: '🚛', registerable: true },
  driver: { label: 'Driver', folder: 'driver', icon: '🧑‍✈️', registerable: true },
  'delivery-personnel': { label: 'Delivery Personnel / Courier', folder: 'delivery-personnel', icon: '📬', registerable: true },
  'procurement-officer': { label: 'Procurement Officer', folder: 'procurement-officer', icon: '🛒', registerable: true },
  'supplier-vendor': { label: 'Supplier / Vendor', folder: 'supplier-vendor', icon: '🏪', registerable: true },
  customer: { label: 'Customer', folder: 'customer', icon: '👤', registerable: true },
  'customer-service': { label: 'Customer Service Representative', folder: 'customer-service', icon: '🎧', registerable: true },
  'route-planner': { label: 'Route Planner', folder: 'route-planner', icon: '🗺️', registerable: true },
  'transport-coordinator': { label: 'Transport Coordinator', folder: 'transport-coordinator', icon: '🔗', registerable: true },
  'quality-assurance': { label: 'Quality Assurance Officer', folder: 'quality-assurance', icon: '🔬', registerable: true },
  'finance-officer': { label: 'Finance Officer', folder: 'finance-officer', icon: '💰', registerable: true },
  auditor: { label: 'Auditor', folder: 'auditor', icon: '🔍', registerable: true },
  'data-analyst': { label: 'Data Analyst', folder: 'data-analyst', icon: '📊', registerable: true },
  'security-officer': { label: 'Security Officer', folder: 'security-officer', icon: '🔒', registerable: true },
  'maintenance-technician': { label: 'Maintenance Technician', folder: 'maintenance-technician', icon: '🔧', registerable: true },
  'branch-manager': { label: 'Branch Manager', folder: 'branch-manager', icon: '🏢', registerable: true },
  'shipment-coordinator': { label: 'Shipment Coordinator', folder: 'shipment-coordinator', icon: '📋', registerable: true },
  'packing-staff': { label: 'Packing Staff', folder: 'packing-staff', icon: '📦', registerable: true },
  'loading-unloading-staff': { label: 'Loading/Unloading Staff', folder: 'loading-unloading-staff', icon: '⬆️', registerable: true },
};

export const ROLE_PAGES: Record<RoleKey, RolePages> = {
  'super-admin': { index: { title: 'Dashboard', subtitle: 'Full system control overview' }, users: { title: 'Manage Users', subtitle: 'Manage all users and permissions' }, settings: { title: 'System Settings', subtitle: 'Configure system settings' }, reports: { title: 'System Reports', subtitle: 'View all reports' }, backup: { title: 'Backup & Restore', subtitle: 'Backup and restore data' } },
  'logistics-manager': { index: { title: 'Dashboard', subtitle: 'Oversee logistics operations' }, shipments: { title: 'Monitor Shipments', subtitle: 'Monitor shipments and deliveries' }, staff: { title: 'Logistics Staff', subtitle: 'Manage logistics staff' }, approve: { title: 'Approve Plans', subtitle: 'Approve logistics plans' }, reports: { title: 'Operational Reports', subtitle: 'Generate operational reports' } },
  'operations-manager': { index: { title: 'Dashboard', subtitle: 'Coordinate daily operations' }, tasks: { title: 'Daily Operations', subtitle: 'Coordinate daily operations' }, assign: { title: 'Assign Tasks', subtitle: 'Assign tasks to teams' }, workflow: { title: 'Workflow Efficiency', subtitle: 'Monitor workflow efficiency' }, performance: { title: 'Performance', subtitle: 'Track operational performance' } },
  'warehouse-manager': { index: { title: 'Dashboard', subtitle: 'Warehouse overview' }, activities: { title: 'Warehouse Activities', subtitle: 'Manage warehouse activities' }, inventory: { title: 'Inventory Levels', subtitle: 'Monitor inventory levels' }, 'approve-movements': { title: 'Approve Movements', subtitle: 'Approve stock movements' }, reports: { title: 'Warehouse Reports', subtitle: 'Generate warehouse reports' } },
  'inventory-controller': { index: { title: 'Dashboard', subtitle: 'Inventory overview' }, stock: { title: 'Stock Quantities', subtitle: 'Track stock quantities' }, transfers: { title: 'Stock Transfers', subtitle: 'Manage stock transfers' }, 'update-records': { title: 'Update Records', subtitle: 'Update inventory records' }, audit: { title: 'Stock Audits', subtitle: 'Conduct stock audits' } },
  dispatcher: { index: { title: 'Dashboard', subtitle: 'Dispatch overview' }, assign: { title: 'Assign Deliveries', subtitle: 'Assign drivers and vehicles' }, schedule: { title: 'Delivery Schedule', subtitle: 'Schedule deliveries' }, monitor: { title: 'Monitor Deliveries', subtitle: 'Monitor delivery status' }, routes: { title: 'Coordinate Routes', subtitle: 'Coordinate routes' } },
  'fleet-manager': { index: { title: 'Dashboard', subtitle: 'Fleet overview' }, vehicles: { title: 'Manage Vehicles', subtitle: 'Manage company vehicles' }, maintenance: { title: 'Vehicle Maintenance', subtitle: 'Monitor vehicle maintenance' }, fuel: { title: 'Fuel Consumption', subtitle: 'Track fuel consumption' }, repairs: { title: 'Schedule Repairs', subtitle: 'Schedule repairs' } },
  driver: { index: { title: 'Dashboard', subtitle: 'Driver overview' }, deliveries: { title: 'My Deliveries', subtitle: 'View assigned deliveries' }, 'update-status': { title: 'Update Status', subtitle: 'Update delivery status' }, 'proof-of-delivery': { title: 'Proof of Delivery', subtitle: 'Record proof of delivery' }, incidents: { title: 'Report Incidents', subtitle: 'Report incidents' } },
  'delivery-personnel': { index: { title: 'Dashboard', subtitle: 'Courier overview' }, deliveries: { title: 'Deliver Shipments', subtitle: 'Deliver shipments' }, progress: { title: 'Delivery Progress', subtitle: 'Update delivery progress' }, signatures: { title: 'Collect Signatures', subtitle: 'Collect signatures' }, evidence: { title: 'Delivery Evidence', subtitle: 'Upload delivery evidence' } },
  'procurement-officer': { index: { title: 'Dashboard', subtitle: 'Procurement overview' }, purchases: { title: 'Supplier Purchases', subtitle: 'Manage supplier purchases' }, 'create-po': { title: 'Create Purchase Order', subtitle: 'Create purchase orders' }, incoming: { title: 'Incoming Goods', subtitle: 'Track incoming goods' }, vendors: { title: 'Vendor Coordination', subtitle: 'Coordinate with vendors' } },
  'supplier-vendor': { index: { title: 'Dashboard', subtitle: 'Vendor overview' }, 'purchase-orders': { title: 'Purchase Orders', subtitle: 'View purchase orders' }, confirm: { title: 'Confirm Deliveries', subtitle: 'Confirm deliveries' }, 'shipment-info': { title: 'Shipment Information', subtitle: 'Update shipment information' } },
  customer: { index: { title: 'Dashboard', subtitle: 'Customer overview' }, 'create-shipment': { title: 'Create Shipment', subtitle: 'Create shipment requests' }, track: { title: 'Track Shipment', subtitle: 'Track shipments' }, history: { title: 'Delivery History', subtitle: 'View delivery history' }, notifications: { title: 'Notifications', subtitle: 'Receive notifications' } },
  'customer-service': { index: { title: 'Dashboard', subtitle: 'Support overview' }, inquiries: { title: 'Customer Inquiries', subtitle: 'Handle customer inquiries' }, resolve: { title: 'Resolve Issues', subtitle: 'Resolve shipment issues' }, requests: { title: 'Customer Requests', subtitle: 'Monitor customer requests' }, reports: { title: 'Support Reports', subtitle: 'Generate support reports' } },
  'route-planner': { index: { title: 'Dashboard', subtitle: 'Route planning overview' }, optimize: { title: 'Optimize Routes', subtitle: 'Optimize delivery routes' }, schedules: { title: 'Delivery Schedules', subtitle: 'Assign delivery schedules' }, efficiency: { title: 'Transport Efficiency', subtitle: 'Analyze transportation efficiency' }, routes: { title: 'Manage Routes', subtitle: 'Manage delivery routes' } },
  'transport-coordinator': { index: { title: 'Dashboard', subtitle: 'Transport overview' }, coordinate: { title: 'Coordinate Transport', subtitle: 'Coordinate transportation activities' }, assignments: { title: 'Vehicle Assignments', subtitle: 'Manage vehicle assignments' }, monitor: { title: 'Monitor Movements', subtitle: 'Monitor shipment movements' } },
  'quality-assurance': { index: { title: 'Dashboard', subtitle: 'QA overview' }, inspect: { title: 'Inspect Shipments', subtitle: 'Inspect goods and shipments' }, 'damaged-items': { title: 'Damaged Items', subtitle: 'Report damaged items' }, compliance: { title: 'Compliance Standards', subtitle: 'Monitor compliance standards' }, reports: { title: 'QA Reports', subtitle: 'Quality assurance reports' } },
  'finance-officer': { index: { title: 'Dashboard', subtitle: 'Finance overview' }, invoices: { title: 'Billing & Invoices', subtitle: 'Manage billing and invoices' }, payments: { title: 'Track Payments', subtitle: 'Track payments' }, reports: { title: 'Financial Reports', subtitle: 'Generate financial reports' }, costs: { title: 'Logistics Costs', subtitle: 'Monitor logistics costs' } },
  auditor: { index: { title: 'Dashboard', subtitle: 'Audit overview' }, transactions: { title: 'Review Transactions', subtitle: 'Review logistics transactions' }, compliance: { title: 'Monitor Compliance', subtitle: 'Monitor compliance' }, 'audit-reports': { title: 'Audit Reports', subtitle: 'Generate audit reports' } },
  'data-analyst': { index: { title: 'Dashboard', subtitle: 'Analytics overview' }, performance: { title: 'Logistics Performance', subtitle: 'Analyze logistics performance' }, dashboard: { title: 'Analytics Dashboard', subtitle: 'Generate dashboards' }, kpis: { title: 'KPI Tracking', subtitle: 'Track KPIs and trends' }, trends: { title: 'Trend Analysis', subtitle: 'Trend analysis' } },
  'security-officer': { index: { title: 'Dashboard', subtitle: 'Security overview' }, security: { title: 'Security Monitor', subtitle: 'Monitor system security' }, 'access-logs': { title: 'Access Logs', subtitle: 'Review access logs' }, 'users-access': { title: 'Access Controls', subtitle: 'Manage user access controls' } },
  'maintenance-technician': { index: { title: 'Dashboard', subtitle: 'Maintenance overview' }, records: { title: 'Maintenance Records', subtitle: 'Manage vehicle maintenance records' }, repairs: { title: 'Repair Logs', subtitle: 'Update repair logs' }, schedule: { title: 'Preventive Maintenance', subtitle: 'Schedule preventive maintenance' }, jobs: { title: 'Active Jobs', subtitle: 'Active maintenance jobs' } },
  'branch-manager': { index: { title: 'Dashboard', subtitle: 'Branch overview' }, 'branch-ops': { title: 'Branch Operations', subtitle: 'Manage logistics operations for a branch' }, warehouse: { title: 'Local Warehouse', subtitle: 'Monitor local warehouse activities' }, staff: { title: 'Branch Staff', subtitle: 'Manage branch staff' }, 'branch-reports': { title: 'Branch Reports', subtitle: 'Generate branch reports' } },
  'shipment-coordinator': { index: { title: 'Dashboard', subtitle: 'Shipment coordination overview' }, process: { title: 'Process Shipments', subtitle: 'Manage shipment processing' }, track: { title: 'Track Progress', subtitle: 'Track shipment progress' }, coordinate: { title: 'Coordinate Shipments', subtitle: 'Coordinate with drivers and customers' } },
  'packing-staff': { index: { title: 'Dashboard', subtitle: 'Packing overview' }, pack: { title: 'Pack Shipments', subtitle: 'Prepare items for shipment' }, records: { title: 'Packing Records', subtitle: 'Update packing records' }, verify: { title: 'Verify Contents', subtitle: 'Verify shipment contents' } },
  'loading-unloading-staff': { index: { title: 'Dashboard', subtitle: 'Loading overview' }, load: { title: 'Load Cargo', subtitle: 'Load cargo' }, unload: { title: 'Unload Cargo', subtitle: 'Unload cargo' }, 'cargo-status': { title: 'Cargo Status', subtitle: 'Update cargo status' }, 'report-damage': { title: 'Report Damage', subtitle: 'Report damaged goods' } },
};

export const NAV_ICONS: Record<string, string> = {
  index: '🏠', users: '👥', settings: '⚙️', reports: '📊', backup: '💾', shipments: '📦', staff: '👔', approve: '✅', tasks: '📝', assign: '📌', workflow: '🔄', performance: '📈', activities: '🏭', inventory: '📦', 'approve-movements': '✔️', stock: '📊', transfers: '🔀', 'update-records': '✏️', audit: '🔍', schedule: '📅', monitor: '📡', routes: '🗺️', vehicles: '🚛', maintenance: '🔧', fuel: '⛽', repairs: '🛠️', deliveries: '🚚', 'update-status': '📍', 'proof-of-delivery': '✍️', incidents: '⚠️', progress: '📈', signatures: '🖊️', evidence: '📷', purchases: '🛒', 'create-po': '📄', incoming: '📥', vendors: '🤝', 'purchase-orders': '📑', confirm: '✅', 'shipment-info': '📨', 'create-shipment': '➕', track: '🔎', history: '📜', notifications: '🔔', inquiries: '💬', resolve: '🛟', requests: '📋', optimize: '⚡', schedules: '🗓️', efficiency: '📉', coordinate: '🎯', assignments: '🔗', inspect: '🔬', 'damaged-items': '💥', compliance: '📋', invoices: '💰', payments: '💳', costs: '💵', transactions: '🧾', 'audit-reports': '📑', dashboard: '📈', kpis: '🎯', trends: '📉', security: '🔒', 'access-logs': '📋', 'users-access': '🛡️', records: '📁', jobs: '🔩', 'branch-ops': '🏢', warehouse: '🏬', 'branch-reports': '📊', process: '⚙️', pack: '📦', verify: '✔️', load: '⬆️', unload: '⬇️', 'cargo-status': '📦', 'report-damage': '⚠️',
};

export const STAT_DEFS: Record<RoleKey, StatDef[]> = {
  'super-admin': [{ key: 'users', label: 'Total Users' }, { key: 'shipments', label: 'Shipments' }, { key: 'vehicles', label: 'Vehicles' }, { key: 'open_tickets', label: 'Open Tickets' }],
  'logistics-manager': [{ key: 'shipments', label: 'Active Shipments' }, { key: 'pending_plans', label: 'Pending Plans' }, { key: 'delivered', label: 'Delivered' }, { key: 'vehicles', label: 'Fleet Size' }],
  'operations-manager': [{ key: 'active_tasks', label: 'Active Tasks' }, { key: 'shipments', label: 'Shipments' }, { key: 'users', label: 'Staff' }, { key: 'efficiency', label: 'Efficiency' }],
  'warehouse-manager': [{ key: 'inventory_items', label: 'Inventory Items' }, { key: 'low_stock', label: 'Low Stock' }, { key: 'pending_movements', label: 'Pending Movements' }, { key: 'users', label: 'Staff' }],
  'inventory-controller': [{ key: 'inventory_items', label: 'Total SKUs' }, { key: 'low_stock', label: 'Low Stock' }, { key: 'pending_movements', label: 'Pending Transfers' }, { key: 'audits', label: 'Audits Due' }],
  dispatcher: [{ key: 'awaiting_dispatch', label: 'Awaiting Dispatch' }, { key: 'active_deliveries', label: 'Active Deliveries' }, { key: 'drivers', label: 'Available Drivers' }, { key: 'vehicles', label: 'Vehicles Ready' }],
  'fleet-manager': [{ key: 'vehicles', label: 'Total Fleet' }, { key: 'in_maintenance', label: 'In Maintenance' }, { key: 'in_use', label: 'In Use' }, { key: 'available', label: 'Available' }],
  driver: [{ key: 'assigned', label: 'Assigned Today' }, { key: 'in_transit', label: 'In Transit' }, { key: 'completed', label: 'Completed' }, { key: 'pending_pod', label: 'Pending POD' }],
  'delivery-personnel': [{ key: 'assigned', label: 'Active Deliveries' }, { key: 'out_for_delivery', label: 'Out for Delivery' }, { key: 'completed', label: 'Completed' }, { key: 'pending_pod', label: 'Signatures Needed' }],
  'procurement-officer': [{ key: 'open_pos', label: 'Open POs' }, { key: 'pending_pos', label: 'Pending Confirmation' }, { key: 'received_pos', label: 'Received' }, { key: 'suppliers', label: 'Suppliers' }],
  'supplier-vendor': [{ key: 'open_pos', label: 'Active POs' }, { key: 'pending_pos', label: 'Awaiting Confirm' }, { key: 'shipped_pos', label: 'Shipped' }, { key: 'received_pos', label: 'Completed' }],
  customer: [{ key: 'my_shipments', label: 'My Shipments' }, { key: 'in_transit', label: 'In Transit' }, { key: 'delivered', label: 'Delivered' }, { key: 'my_tickets', label: 'Open Tickets' }],
  'customer-service': [{ key: 'open_tickets', label: 'Open Tickets' }, { key: 'in_progress_tickets', label: 'In Progress' }, { key: 'resolved_today', label: 'Resolved Today' }, { key: 'high_priority', label: 'High Priority' }],
  'route-planner': [{ key: 'active_routes', label: 'Active Routes' }, { key: 'planned_routes', label: 'Planned' }, { key: 'total_distance', label: 'Total Distance (km)' }, { key: 'routed_shipments', label: 'Shipments Routed' }],
  'transport-coordinator': [{ key: 'active_deliveries', label: 'Active Transports' }, { key: 'pending_coord', label: 'Pending Coordination' }, { key: 'in_use', label: 'Vehicles Assigned' }, { key: 'active_routes', label: 'Routes Active' }],
  'quality-assurance': [{ key: 'pending_inspection', label: 'Pending Inspection' }, { key: 'passed', label: 'Passed' }, { key: 'failed', label: 'Failed' }, { key: 'compliance', label: 'Compliance Rate' }],
  'finance-officer': [{ key: 'pending_invoices', label: 'Pending Invoices' }, { key: 'paid_invoices', label: 'Paid' }, { key: 'overdue_invoices', label: 'Overdue' }, { key: 'revenue', label: 'Total Revenue' }],
  auditor: [{ key: 'audit_logs', label: 'Audit Logs' }, { key: 'transactions', label: 'Transactions' }, { key: 'compliance_issues', label: 'Compliance Issues' }, { key: 'users', label: 'Users Reviewed' }],
  'data-analyst': [{ key: 'shipments', label: 'Total Shipments' }, { key: 'delivery_rate', label: 'Delivery Rate' }, { key: 'avg_transit', label: 'Avg Transit Time' }, { key: 'fleet_util', label: 'Fleet Utilization' }],
  'security-officer': [{ key: 'access_events', label: 'Access Events' }, { key: 'failed_logins', label: 'Failed Logins' }, { key: 'users', label: 'Active Users' }, { key: 'suspended', label: 'Suspended' }],
  'maintenance-technician': [{ key: 'scheduled_jobs', label: 'Scheduled Jobs' }, { key: 'in_progress_jobs', label: 'In Progress' }, { key: 'completed_jobs', label: 'Completed' }, { key: 'vehicles', label: 'Vehicles Serviced' }],
  'branch-manager': [{ key: 'branch_shipments', label: 'Branch Shipments' }, { key: 'branch_staff', label: 'Staff Count' }, { key: 'inventory_items', label: 'Inventory Items' }, { key: 'deliveries_today', label: 'Deliveries Today' }],
  'shipment-coordinator': [{ key: 'pending_processing', label: 'Pending Processing' }, { key: 'processing', label: 'In Processing' }, { key: 'approved', label: 'Ready to Pack' }, { key: 'issues', label: 'Issues' }],
  'packing-staff': [{ key: 'awaiting_pack', label: 'Awaiting Pack' }, { key: 'packed_today', label: 'Packed Today' }, { key: 'pending_verify', label: 'Pending Verify' }, { key: 'packed_total', label: 'Completed' }],
  'loading-unloading-staff': [{ key: 'ready_load', label: 'Ready to Load' }, { key: 'loaded_today', label: 'Loaded Today' }, { key: 'awaiting_unload', label: 'Awaiting Unload' }, { key: 'damage_reports', label: 'Damage Reports' }],
};

export const DEMO_PASSWORD = 'password';

export const DEMO_USERS: Record<RoleKey, { full_name: string; email: string; phone: string; branch_id: number | null }> = {
  'super-admin': { full_name: 'Alex Rivera', email: 'lms.superadmin@gmail.com', phone: '+63-900-100-0001', branch_id: 1 },
  'logistics-manager': { full_name: 'Maria Santos', email: 'lms.logisticsmanager@gmail.com', phone: '+63-900-100-0002', branch_id: 1 },
  'operations-manager': { full_name: 'James Chen', email: 'lms.operationsmanager@gmail.com', phone: '+63-900-100-0003', branch_id: 1 },
  'warehouse-manager': { full_name: 'Elena Cruz', email: 'lms.warehousemanager@gmail.com', phone: '+63-900-100-0004', branch_id: 1 },
  'inventory-controller': { full_name: 'Ryan Mendoza', email: 'lms.inventorycontroller@gmail.com', phone: '+63-900-100-0005', branch_id: 1 },
  dispatcher: { full_name: 'Sophie Lim', email: 'lms.dispatcher@gmail.com', phone: '+63-900-100-0006', branch_id: 1 },
  'fleet-manager': { full_name: 'Marcus Reyes', email: 'lms.fleetmanager@gmail.com', phone: '+63-900-100-0007', branch_id: 1 },
  driver: { full_name: 'Juan Dela Cruz', email: 'lms.driver@gmail.com', phone: '+63-900-100-0008', branch_id: 1 },
  'delivery-personnel': { full_name: 'Anna Torres', email: 'lms.deliverycourier@gmail.com', phone: '+63-900-100-0009', branch_id: 2 },
  'procurement-officer': { full_name: 'David Park', email: 'lms.procurement@gmail.com', phone: '+63-900-100-0010', branch_id: 1 },
  'supplier-vendor': { full_name: 'Lisa Wong Supplies', email: 'lms.supplier@gmail.com', phone: '+63-900-100-0011', branch_id: null },
  customer: { full_name: 'Michael Garcia', email: 'lms.customer@gmail.com', phone: '+63-900-100-0012', branch_id: 2 },
  'customer-service': { full_name: 'Grace Villanueva', email: 'lms.customerservice@gmail.com', phone: '+63-900-100-0013', branch_id: 1 },
  'route-planner': { full_name: 'Kevin Tan', email: 'lms.routeplanner@gmail.com', phone: '+63-900-100-0014', branch_id: 1 },
  'transport-coordinator': { full_name: 'Patricia Ramos', email: 'lms.transportcoord@gmail.com', phone: '+63-900-100-0015', branch_id: 1 },
  'quality-assurance': { full_name: 'Robert Singh', email: 'lms.qualityassurance@gmail.com', phone: '+63-900-100-0016', branch_id: 1 },
  'finance-officer': { full_name: 'Jennifer Lo', email: 'lms.finance@gmail.com', phone: '+63-900-100-0017', branch_id: 1 },
  auditor: { full_name: 'Thomas Aquino', email: 'lms.auditor@gmail.com', phone: '+63-900-100-0018', branch_id: 1 },
  'data-analyst': { full_name: 'Nicole Fernandez', email: 'lms.dataanalyst@gmail.com', phone: '+63-900-100-0019', branch_id: 1 },
  'security-officer': { full_name: 'Victor Navarro', email: 'lms.security@gmail.com', phone: '+63-900-100-0020', branch_id: 1 },
  'maintenance-technician': { full_name: 'Carlos Bautista', email: 'lms.maintenance@gmail.com', phone: '+63-900-100-0021', branch_id: 1 },
  'branch-manager': { full_name: 'Helen Morales', email: 'lms.branchmanager@gmail.com', phone: '+63-900-100-0022', branch_id: 2 },
  'shipment-coordinator': { full_name: 'Oliver Castillo', email: 'lms.shipmentcoord@gmail.com', phone: '+63-900-100-0023', branch_id: 1 },
  'packing-staff': { full_name: 'Betty Gonzales', email: 'lms.packingstaff@gmail.com', phone: '+63-900-100-0024', branch_id: 1 },
  'loading-unloading-staff': { full_name: 'Frankie Santos', email: 'lms.loadingstaff@gmail.com', phone: '+63-900-100-0025', branch_id: 1 },
};

export function getRoleLabel(role: RoleKey): string {
  return ROLES[role]?.label ?? role;
}

export function getRoleFolder(role: RoleKey): string {
  return ROLES[role]?.folder ?? role;
}

export const ALL_ROLE_KEYS = Object.keys(ROLES) as RoleKey[];
