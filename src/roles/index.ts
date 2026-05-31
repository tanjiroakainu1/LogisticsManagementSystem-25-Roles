import { SuperAdminRoutes } from './super-admin/routes';
import { LogisticsManagerRoutes } from './logistics-manager/routes';
import { OperationsManagerRoutes } from './operations-manager/routes';
import { WarehouseManagerRoutes } from './warehouse-manager/routes';
import { InventoryControllerRoutes } from './inventory-controller/routes';
import { DispatcherRoutes } from './dispatcher/routes';
import { FleetManagerRoutes } from './fleet-manager/routes';
import { DriverRoutes } from './driver/routes';
import { DeliveryPersonnelRoutes } from './delivery-personnel/routes';
import { ProcurementOfficerRoutes } from './procurement-officer/routes';
import { SupplierVendorRoutes } from './supplier-vendor/routes';
import { CustomerRoutes } from './customer/routes';
import { CustomerServiceRoutes } from './customer-service/routes';
import { RoutePlannerRoutes } from './route-planner/routes';
import { TransportCoordinatorRoutes } from './transport-coordinator/routes';
import { QualityAssuranceRoutes } from './quality-assurance/routes';
import { FinanceOfficerRoutes } from './finance-officer/routes';
import { AuditorRoutes } from './auditor/routes';
import { DataAnalystRoutes } from './data-analyst/routes';
import { SecurityOfficerRoutes } from './security-officer/routes';
import { MaintenanceTechnicianRoutes } from './maintenance-technician/routes';
import { BranchManagerRoutes } from './branch-manager/routes';
import { ShipmentCoordinatorRoutes } from './shipment-coordinator/routes';
import { PackingStaffRoutes } from './packing-staff/routes';
import { LoadingUnloadingStaffRoutes } from './loading-unloading-staff/routes';

export const roleRouteMap = {
  'super-admin': SuperAdminRoutes,
  'logistics-manager': LogisticsManagerRoutes,
  'operations-manager': OperationsManagerRoutes,
  'warehouse-manager': WarehouseManagerRoutes,
  'inventory-controller': InventoryControllerRoutes,
  'dispatcher': DispatcherRoutes,
  'fleet-manager': FleetManagerRoutes,
  'driver': DriverRoutes,
  'delivery-personnel': DeliveryPersonnelRoutes,
  'procurement-officer': ProcurementOfficerRoutes,
  'supplier-vendor': SupplierVendorRoutes,
  'customer': CustomerRoutes,
  'customer-service': CustomerServiceRoutes,
  'route-planner': RoutePlannerRoutes,
  'transport-coordinator': TransportCoordinatorRoutes,
  'quality-assurance': QualityAssuranceRoutes,
  'finance-officer': FinanceOfficerRoutes,
  'auditor': AuditorRoutes,
  'data-analyst': DataAnalystRoutes,
  'security-officer': SecurityOfficerRoutes,
  'maintenance-technician': MaintenanceTechnicianRoutes,
  'branch-manager': BranchManagerRoutes,
  'shipment-coordinator': ShipmentCoordinatorRoutes,
  'packing-staff': PackingStaffRoutes,
  'loading-unloading-staff': LoadingUnloadingStaffRoutes,
};
