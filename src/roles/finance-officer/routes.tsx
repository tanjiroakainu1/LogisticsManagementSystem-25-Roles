import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Costs from './pages/Costs';

export const FinanceOfficerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'invoices', element: <Invoices /> },
  { path: 'payments', element: <Payments /> },
  { path: 'reports', element: <Reports /> },
  { path: 'costs', element: <Costs /> },
];
