import Dashboard from './pages/Dashboard';
import CreateShipment from './pages/CreateShipment';
import Track from './pages/Track';
import History from './pages/History';
import Notifications from './pages/Notifications';

export const CustomerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'create-shipment', element: <CreateShipment /> },
  { path: 'track', element: <Track /> },
  { path: 'history', element: <History /> },
  { path: 'notifications', element: <Notifications /> },
];
