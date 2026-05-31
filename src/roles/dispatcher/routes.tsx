import Dashboard from './pages/Dashboard';
import Assign from './pages/Assign';
import Schedule from './pages/Schedule';
import Monitor from './pages/Monitor';
import Routes from './pages/Routes';

export const DispatcherRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'assign', element: <Assign /> },
  { path: 'schedule', element: <Schedule /> },
  { path: 'monitor', element: <Monitor /> },
  { path: 'routes', element: <Routes /> },
];
