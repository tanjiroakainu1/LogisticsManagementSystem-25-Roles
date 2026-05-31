import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Progress from './pages/Progress';
import Signatures from './pages/Signatures';
import Evidence from './pages/Evidence';

export const DeliveryPersonnelRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'deliveries', element: <Deliveries /> },
  { path: 'progress', element: <Progress /> },
  { path: 'signatures', element: <Signatures /> },
  { path: 'evidence', element: <Evidence /> },
];
