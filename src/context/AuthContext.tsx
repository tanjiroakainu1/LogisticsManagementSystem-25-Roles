import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AuthUser, RoleKey } from '@/types';
import { DEMO_PASSWORD, DEMO_USERS } from '@/config/roles';
import { loadData, getUserByEmail, saveData } from '@/lib/store';
import { logAccess, logCrud } from '@/lib/services';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  demoLogin: (role: RoleKey) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_KEY = 'lms_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(AUTH_KEY);
  };

  const login = useCallback((email: string, password: string) => {
    const data = loadData();
    const found = getUserByEmail(data, email);
    if (!found || found.password !== password) {
      logAccess(data, null, email, 'failed_login');
      logCrud(data, null, 'update', 'session', null, email, 'Failed login attempt');
      saveData(data);
      return false;
    }
    const authUser: AuthUser = { id: found.id, full_name: found.full_name, email: found.email, role: found.role, branch_id: found.branch_id };
    logAccess(data, found.id, email, 'login');
    logCrud(data, authUser, 'update', 'session', found.id, found.email, 'Logged in');
    saveData(data);
    persist(authUser);
    return true;
  }, []);

  const demoLogin = useCallback((role: RoleKey) => {
    const demo = DEMO_USERS[role];
    if (!demo) return false;
    return login(demo.email, DEMO_PASSWORD);
  }, [login]);

  const logout = useCallback(() => {
    if (user) {
      const data = loadData();
      logAccess(data, user.id, user.email, 'logout');
      logCrud(data, user, 'update', 'session', user.id, user.email, 'Logged out');
      saveData(data);
    }
    persist(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
