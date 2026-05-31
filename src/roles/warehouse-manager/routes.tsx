import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Inventory from './pages/Inventory';
import ApproveMovements from './pages/ApproveMovements';
import Reports from './pages/Reports';

export const WarehouseManagerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'activities', element: <Activities /> },
  { path: 'inventory', element: <Inventory /> },
  { path: 'approve-movements', element: <ApproveMovements /> },
  { path: 'reports', element: <Reports /> },
];
