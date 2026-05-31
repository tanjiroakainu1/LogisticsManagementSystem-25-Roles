import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import UpdateStatus from './pages/UpdateStatus';
import ProofOfDelivery from './pages/ProofOfDelivery';
import Incidents from './pages/Incidents';

export const DriverRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'deliveries', element: <Deliveries /> },
  { path: 'update-status', element: <UpdateStatus /> },
  { path: 'proof-of-delivery', element: <ProofOfDelivery /> },
  { path: 'incidents', element: <Incidents /> },
];
