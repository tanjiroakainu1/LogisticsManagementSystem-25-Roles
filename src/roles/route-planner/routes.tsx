import Dashboard from './pages/Dashboard';
import Optimize from './pages/Optimize';
import Schedules from './pages/Schedules';
import Efficiency from './pages/Efficiency';
import Routes from './pages/Routes';

export const RoutePlannerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'optimize', element: <Optimize /> },
  { path: 'schedules', element: <Schedules /> },
  { path: 'efficiency', element: <Efficiency /> },
  { path: 'routes', element: <Routes /> },
];
