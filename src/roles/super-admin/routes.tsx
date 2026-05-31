import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Backup from './pages/Backup';

export const SuperAdminRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'users', element: <Users /> },
  { path: 'settings', element: <Settings /> },
  { path: 'reports', element: <Reports /> },
  { path: 'backup', element: <Backup /> },
];
