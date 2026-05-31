import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Repairs from './pages/Repairs';
import Schedule from './pages/Schedule';
import Jobs from './pages/Jobs';

export const MaintenanceTechnicianRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'records', element: <Records /> },
  { path: 'repairs', element: <Repairs /> },
  { path: 'schedule', element: <Schedule /> },
  { path: 'jobs', element: <Jobs /> },
];
