import Dashboard from './pages/Dashboard';
import PurchaseOrders from './pages/PurchaseOrders';
import Confirm from './pages/Confirm';
import ShipmentInfo from './pages/ShipmentInfo';

export const SupplierVendorRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'purchase-orders', element: <PurchaseOrders /> },
  { path: 'confirm', element: <Confirm /> },
  { path: 'shipment-info', element: <ShipmentInfo /> },
];
