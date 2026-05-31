import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Compliance from './pages/Compliance';
import AuditReports from './pages/AuditReports';

export const AuditorRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'transactions', element: <Transactions /> },
  { path: 'compliance', element: <Compliance /> },
  { path: 'audit-reports', element: <AuditReports /> },
];
