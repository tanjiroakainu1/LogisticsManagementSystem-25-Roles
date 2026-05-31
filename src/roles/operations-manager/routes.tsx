import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Assign from './pages/Assign';
import Workflow from './pages/Workflow';
import Performance from './pages/Performance';

export const OperationsManagerRoutes = [
  { path: '', element: <Dashboard /> },
  { path: 'tasks', element: <Tasks /> },
  { path: 'assign', element: <Assign /> },
  { path: 'workflow', element: <Workflow /> },
  { path: 'performance', element: <Performance /> },
];
