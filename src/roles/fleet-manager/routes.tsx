import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import Fuel from './pages/Fuel';
import Repairs from './pages/Repairs';

export const FleetManagerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'vehicles', element: <Vehicles /> },
  { path: 'maintenance', element: <Maintenance /> },
  { path: 'fuel', element: <Fuel /> },
  { path: 'repairs', element: <Repairs /> },
];
