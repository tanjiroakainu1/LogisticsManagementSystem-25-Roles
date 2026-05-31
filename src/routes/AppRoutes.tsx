import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import { roleRouteMap } from '@/roles';
import { ALL_ROLE_KEYS, getRoleFolder } from '@/config/roles';
import type { RoleKey } from '@/types';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {ALL_ROLE_KEYS.map((role) => {
        const folder = getRoleFolder(role as RoleKey);
        const routes = roleRouteMap[role as RoleKey] ?? [];
        return (
          <Route key={role} path={`/${folder}`} element={<ProtectedRoute role={role as RoleKey} />}>
            <Route element={<AppShell role={role as RoleKey} />}>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
          </Route>
        );
      })}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
