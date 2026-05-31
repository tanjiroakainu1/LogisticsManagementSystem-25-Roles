import Dashboard from './pages/Dashboard';
import BranchOps from './pages/BranchOps';
import Warehouse from './pages/Warehouse';
import Staff from './pages/Staff';
import BranchReports from './pages/BranchReports';

export const BranchManagerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'branch-ops', element: <BranchOps /> },
  { path: 'warehouse', element: <Warehouse /> },
  { path: 'staff', element: <Staff /> },
  { path: 'branch-reports', element: <BranchReports /> },
];
