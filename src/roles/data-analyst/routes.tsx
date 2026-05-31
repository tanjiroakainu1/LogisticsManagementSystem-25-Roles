import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Kpis from './pages/Kpis';
import Trends from './pages/Trends';

export const DataAnalystRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'performance', element: <Performance /> },
  { path: 'dashboard', element: <AnalyticsDashboard /> },
  { path: 'kpis', element: <Kpis /> },
  { path: 'trends', element: <Trends /> },
];
