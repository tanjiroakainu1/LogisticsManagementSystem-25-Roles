import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { ALL_ROLE_KEYS, ROLES } from '@/config/roles';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DeveloperShowcase } from '@/components/ui/DeveloperCredit';
import { registerUser } from '@/lib/services';
import type { RoleKey } from '@/types';

export default function RegisterPage() {
  const { data, update } = useData();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirm_password') as string;
    if (password !== confirm) { setMessage('Passwords do not match.'); return; }
    if (password.length < 6) { setMessage('Password must be at least 6 characters.'); return; }
    const role = fd.get('role') as RoleKey;
    if (!ROLES[role]?.registerable) { setMessage('Invalid role selected.'); return; }
    let ok = false;
    update((d) => {
      ok = registerUser(d, {
        full_name: fd.get('full_name') as string,
        email: fd.get('email') as string,
        password,
        role,
        branch_id: parseInt(fd.get('branch_id') as string) || null,
        phone: fd.get('phone') as string,
      });
    });
    if (ok) {
      setSuccess(true);
      setMessage('Registration successful! You can now login.');
    } else {
      setMessage('Email already registered.');
    }
  };

  return (
    <PublicLayout active="register">
      <div className="page-container flex flex-1 items-start justify-center p-3 sm:p-6">
        <div className="w-full max-w-lg candy-surface p-4 sm:p-6 lg:p-7">
          <h2 className="text-xl font-extrabold text-candy-900 sm:text-2xl">Create your account</h2>
          <p className="mb-4 text-sm text-candy-500 sm:mb-5 sm:text-base">Join the logistics network</p>
          {message && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${success ? 'border border-pastel-mint bg-pastel-mint/80 text-candy-800' : 'border border-pastel-rose bg-pastel-rose/80 text-candy-800'}`}>
              {message}
            </div>
          )}
          {success ? (
            <Link to="/login" className="btn btn-primary btn-block">Go to Login</Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input name="full_name" required autoComplete="name" /></div>
                <div className="form-group"><label>Phone</label><input name="phone" type="tel" autoComplete="tel" /></div>
              </div>
              <div className="form-group"><label>Email *</label><input name="email" type="email" required placeholder="yourname@gmail.com" autoComplete="email" /></div>
              <div className="form-row">
                <div className="form-group"><label>Password *</label><input name="password" type="password" required minLength={6} autoComplete="new-password" /></div>
                <div className="form-group"><label>Confirm *</label><input name="confirm_password" type="password" required minLength={6} autoComplete="new-password" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Role *</label><select name="role" required><option value="">Select role</option>{ALL_ROLE_KEYS.filter((r) => ROLES[r].registerable).map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}</select></div>
                <div className="form-group"><label>Branch</label><select name="branch_id"><option value="">Select</option>{data.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
              </div>
              <button type="submit" className="btn btn-primary btn-block">Register</button>
            </form>
          )}
          <p className="mt-5 text-center text-sm text-candy-500">Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">Sign in</Link></p>
          <DeveloperShowcase className="mt-6" />
        </div>
      </div>
    </PublicLayout>
  );
}
