import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Staff from './pages/Staff';
import Approve from './pages/Approve';
import Reports from './pages/Reports';

export const LogisticsManagerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'shipments', element: <Shipments /> },
  { path: 'staff', element: <Staff /> },
  { path: 'approve', element: <Approve /> },
  { path: 'reports', element: <Reports /> },
];
