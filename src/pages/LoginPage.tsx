import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ALL_ROLE_KEYS, DEMO_PASSWORD, DEMO_USERS, getRoleFolder, getRoleLabel, ROLES } from '@/config/roles';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DeveloperShowcase } from '@/components/ui/DeveloperCredit';
import type { RoleKey } from '@/types';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      const user = JSON.parse(sessionStorage.getItem('lms_auth_user') || '{}');
      navigate(`/${getRoleFolder(user.role)}/`);
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleDemo = (role: RoleKey) => {
    if (demoLogin(role)) navigate(`/${getRoleFolder(role)}/`);
    else setError('Demo login failed.');
  };

  return (
    <PublicLayout active="login">
      <div className="page-container flex flex-col gap-4 p-3 sm:gap-5 sm:p-5 lg:grid lg:grid-cols-[minmax(0,400px)_1fr] lg:items-start">
        <section className="candy-surface p-4 sm:p-6 lg:p-7">
          <h2 className="text-xl font-extrabold text-candy-900 sm:text-2xl">Welcome back</h2>
          <p className="mb-4 text-sm text-candy-500 sm:mb-5 sm:text-base">Sign in with your Gmail demo account</p>
          {error && <div className="mb-4 rounded-xl border border-pastel-rose bg-pastel-rose/80 px-4 py-3 text-sm font-semibold text-candy-800">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group"><label>Gmail Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="lms.superadmin@gmail.com" autoComplete="email" /></div>
            <div className="form-group"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="password" autoComplete="current-password" /></div>
            <button type="submit" className="btn btn-primary btn-block">Sign In</button>
          </form>
          <div className="mt-4 rounded-xl border border-dashed border-accent-light/50 bg-accent-soft/60 p-3 text-sm text-candy-700 sm:mt-5 sm:p-4">
            <p><strong>Demo password (all roles):</strong> {DEMO_PASSWORD}</p>
            <p className="break-all text-primary">Example: lms.customer@gmail.com</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {(['super-admin', 'customer', 'dispatcher', 'transport-coordinator'] as RoleKey[]).map((r) => (
              <button key={r} type="button" className="btn btn-sm btn-outline !min-h-[40px] truncate" onClick={() => { setEmail(DEMO_USERS[r].email); setPassword(DEMO_PASSWORD); }}>{getRoleLabel(r)}</button>
            ))}
          </div>
          <DeveloperShowcase className="mt-5" />
        </section>

        <section className="flex min-h-0 flex-col candy-surface p-4 sm:p-6 lg:max-h-[calc(100vh-12rem)]">
          <h2 className="text-lg font-extrabold text-candy-900 sm:text-xl">Quick Access — All 25 Roles</h2>
          <p className="mb-3 text-sm text-candy-500 sm:mb-4">Click any role to log in instantly</p>
          <div className="grid flex-1 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {ALL_ROLE_KEYS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleDemo(role)}
                className="flex min-h-[72px] items-center gap-3 rounded-xl border border-candy-200/80 bg-candy-50/50 p-3 text-left transition hover:border-accent-light hover:bg-accent-soft/50 hover:shadow-candy active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pastel-lavender to-pastel-mint text-lg">{ROLES[role].icon}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-candy-900">{getRoleLabel(role)}</strong>
                  <em className="block truncate text-xs text-candy-500 not-italic">{DEMO_USERS[role].full_name}</em>
                  <small className="block truncate text-[10px] font-semibold text-primary">{DEMO_USERS[role].email}</small>
                </span>
                <span className="shrink-0 text-accent">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
