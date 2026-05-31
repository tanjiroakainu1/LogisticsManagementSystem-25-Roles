import Dashboard from './pages/Dashboard';
import Security from './pages/Security';
import AccessLogs from './pages/AccessLogs';
import UsersAccess from './pages/UsersAccess';

export const SecurityOfficerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'security', element: <Security /> },
  { path: 'access-logs', element: <AccessLogs /> },
  { path: 'users-access', element: <UsersAccess /> },
];
