import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import Resolve from './pages/Resolve';
import Requests from './pages/Requests';
import Reports from './pages/Reports';

export const CustomerServiceRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'inquiries', element: <Inquiries /> },
  { path: 'resolve', element: <Resolve /> },
  { path: 'requests', element: <Requests /> },
  { path: 'reports', element: <Reports /> },
];
