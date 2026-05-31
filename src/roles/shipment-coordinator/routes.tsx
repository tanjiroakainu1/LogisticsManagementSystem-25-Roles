import Dashboard from './pages/Dashboard';
import Process from './pages/Process';
import Track from './pages/Track';
import Coordinate from './pages/Coordinate';

export const ShipmentCoordinatorRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'process', element: <Process /> },
  { path: 'track', element: <Track /> },
  { path: 'coordinate', element: <Coordinate /> },
];
