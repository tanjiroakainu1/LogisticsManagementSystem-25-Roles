import Dashboard from './pages/Dashboard';
import Load from './pages/Load';
import Unload from './pages/Unload';
import CargoStatus from './pages/CargoStatus';
import ReportDamage from './pages/ReportDamage';

export const LoadingUnloadingStaffRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'load', element: <Load /> },
  { path: 'unload', element: <Unload /> },
  { path: 'cargo-status', element: <CargoStatus /> },
  { path: 'report-damage', element: <ReportDamage /> },
];
