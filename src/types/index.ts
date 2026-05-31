export type RoleKey =
  | 'super-admin'
  | 'logistics-manager'
  | 'operations-manager'
  | 'warehouse-manager'
  | 'inventory-controller'
  | 'dispatcher'
  | 'fleet-manager'
  | 'driver'
  | 'delivery-personnel'
  | 'procurement-officer'
  | 'supplier-vendor'
  | 'customer'
  | 'customer-service'
  | 'route-planner'
  | 'transport-coordinator'
  | 'quality-assurance'
  | 'finance-officer'
  | 'auditor'
  | 'data-analyst'
  | 'security-officer'
  | 'maintenance-technician'
  | 'branch-manager'
  | 'shipment-coordinator'
  | 'packing-staff'
  | 'loading-unloading-staff';

export type ShipmentStatus =
  | 'pending'
  | 'approved'
  | 'processing'
  | 'packed'
  | 'loaded'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'issue';

export type UserStatus = 'active' | 'inactive' | 'suspended';
export type Priority = 'normal' | 'high' | 'urgent';

export interface Branch {
  id: number;
  name: string;
  location: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  password: string;
  role: RoleKey;
  branch_id: number | null;
  phone?: string;
  status: UserStatus;
  created_at: string;
}

export interface Shipment {
  id: number;
  tracking_number: string;
  customer_id: number;
  origin: string;
  destination: string;
  description?: string;
  weight_kg: number;
  status: ShipmentStatus;
  priority: Priority;
  branch_id: number | null;
  coordinator_id: number | null;
  route_id: number | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentStatusLog {
  id: number;
  shipment_id: number;
  status: string;
  notes?: string;
  updated_by: number;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  quantity: number;
  min_quantity: number;
  warehouse_location?: string;
  branch_id: number | null;
  status: 'available' | 'low_stock' | 'out_of_stock';
}

export interface StockMovement {
  id: number;
  item_id: number;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  from_location?: string;
  to_location?: string;
  reference?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requested_by: number;
  approved_by: number | null;
  notes?: string;
  created_at: string;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  model: string;
  type: 'truck' | 'van' | 'motorcycle' | 'container';
  capacity_kg: number;
  fuel_level: number;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  branch_id: number | null;
  assigned_driver_id: number | null;
  last_maintenance: string | null;
}

export interface DeliveryRoute {
  id: number;
  route_name: string;
  waypoints?: string;
  distance_km: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  planner_id: number | null;
}

export interface DeliveryAssignment {
  id: number;
  shipment_id: number;
  driver_id: number;
  vehicle_id: number | null;
  dispatcher_id: number;
  route_id: number | null;
  status: 'assigned' | 'accepted' | 'in_transit' | 'delivered' | 'failed';
  assigned_at: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  procurement_officer_id: number;
  supplier_id: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expected_delivery: string | null;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  shipment_id: number | null;
  customer_id: number;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  customer_id: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: Priority;
  assigned_to: number | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details?: string;
  created_at: string;
}

export type CrudOperation = 'create' | 'update' | 'delete';

export interface CrudRecord {
  id: number;
  user_id: number;
  user_role: RoleKey;
  operation: CrudOperation;
  entity_type: string;
  entity_id: number | null;
  record_label: string;
  details?: string;
  created_at: string;
}

export interface AccessLog {
  id: number;
  user_id: number | null;
  email: string;
  action: string;
  ip_address?: string;
  created_at: string;
}

export interface OperationalTask {
  id: number;
  title: string;
  description?: string;
  assigned_to: number;
  assigned_by: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  created_at: string;
}

export interface LogisticsPlan {
  id: number;
  title: string;
  description?: string;
  created_by: number;
  approved_by: number | null;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
}

export interface QualityInspection {
  id: number;
  shipment_id: number;
  inspector_id: number;
  result: 'passed' | 'failed' | 'conditional';
  damage_report?: string;
  inspected_at: string;
}

export interface PackingRecord {
  id: number;
  shipment_id: number;
  packer_id: number;
  verified: boolean;
  packed_at: string;
}

export interface LoadingRecord {
  id: number;
  shipment_id: number;
  staff_id: number;
  action_type: 'load' | 'unload';
  condition_status: 'good' | 'damaged';
  damage_notes?: string;
  recorded_at: string;
}

export interface VehicleMaintenance {
  id: number;
  vehicle_id: number;
  technician_id: number | null;
  type: string;
  description?: string;
  cost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  liters: number;
  cost: number;
  odometer: number;
  logged_by: number;
  logged_at: string;
}

export interface AppData {
  branches: Branch[];
  users: User[];
  shipments: Shipment[];
  shipmentStatusLogs: ShipmentStatusLog[];
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  vehicles: Vehicle[];
  deliveryRoutes: DeliveryRoute[];
  deliveryAssignments: DeliveryAssignment[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  supportTickets: SupportTicket[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  crudRecords: CrudRecord[];
  accessLogs: AccessLog[];
  operationalTasks: OperationalTask[];
  logisticsPlans: LogisticsPlan[];
  qualityInspections: QualityInspection[];
  packingRecords: PackingRecord[];
  loadingRecords: LoadingRecord[];
  vehicleMaintenance: VehicleMaintenance[];
  fuelLogs: FuelLog[];
  nextId: Record<string, number>;
}

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: RoleKey;
  branch_id: number | null;
}

export interface PageMeta {
  title: string;
  subtitle: string;
}

export type RolePages = Record<string, PageMeta>;

export interface StatDef {
  key: string;
  label: string;
  class?: string;
}
