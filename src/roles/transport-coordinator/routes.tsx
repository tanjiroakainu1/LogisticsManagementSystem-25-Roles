import Dashboard from './pages/Dashboard';
import Coordinate from './pages/Coordinate';
import Assignments from './pages/Assignments';
import Monitor from './pages/Monitor';

export const TransportCoordinatorRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'coordinate', element: <Coordinate /> },
  { path: 'assignments', element: <Assignments /> },
  { path: 'monitor', element: <Monitor /> },
];
