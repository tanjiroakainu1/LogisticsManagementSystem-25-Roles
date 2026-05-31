import Dashboard from './pages/Dashboard';
import Pack from './pages/Pack';
import Records from './pages/Records';
import Verify from './pages/Verify';

export const PackingStaffRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'pack', element: <Pack /> },
  { path: 'records', element: <Records /> },
  { path: 'verify', element: <Verify /> },
];
