import Dashboard from './pages/Dashboard';
import Inspect from './pages/Inspect';
import DamagedItems from './pages/DamagedItems';
import Compliance from './pages/Compliance';
import Reports from './pages/Reports';

export const QualityAssuranceRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'inspect', element: <Inspect /> },
  { path: 'damaged-items', element: <DamagedItems /> },
  { path: 'compliance', element: <Compliance /> },
  { path: 'reports', element: <Reports /> },
];
