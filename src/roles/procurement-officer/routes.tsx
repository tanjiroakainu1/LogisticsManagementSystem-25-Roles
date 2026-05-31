import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import CreatePo from './pages/CreatePo';
import Incoming from './pages/Incoming';
import Vendors from './pages/Vendors';

export const ProcurementOfficerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'purchases', element: <Purchases /> },
  { path: 'create-po', element: <CreatePo /> },
  { path: 'incoming', element: <Incoming /> },
  { path: 'vendors', element: <Vendors /> },
];
