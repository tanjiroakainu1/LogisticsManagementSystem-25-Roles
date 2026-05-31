import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleFolder } from '@/config/roles';
import type { RoleKey } from '@/types';

export function ProtectedRoute({ role }: { role?: RoleKey }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace state={{ from: 'protected' }} />;
  if (role && user.role !== role) return <Navigate to={`/${getRoleFolder(user.role)}/`} replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to={`/${getRoleFolder(user.role)}/`} replace />;
  return <Outlet />;
}
