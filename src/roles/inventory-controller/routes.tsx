import Dashboard from './pages/Dashboard';
import Stock from './pages/Stock';
import Transfers from './pages/Transfers';
import UpdateRecords from './pages/UpdateRecords';
import Audit from './pages/Audit';

export const InventoryControllerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'stock', element: <Stock /> },
  { path: 'transfers', element: <Transfers /> },
  { path: 'update-records', element: <UpdateRecords /> },
  { path: 'audit', element: <Audit /> },
];
