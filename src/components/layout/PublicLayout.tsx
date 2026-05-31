import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PLATFORM } from '@/config/brand';
import { DeveloperFooter } from '@/components/ui/DeveloperCredit';

type PublicNav = 'home' | 'login' | 'register';

export function PublicLayout({
  children,
  active = 'home',
}: {
  children: ReactNode;
  active?: PublicNav;
}) {
  const navLink = (to: string, label: string, key: PublicNav) => {
    const isActive = active === key;
    if (key === 'home' && active === 'home') {
      return (
        <span className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold text-white sm:text-sm">
          {label}
        </span>
      );
    }
    if (isActive && key !== 'home') {
      return (
        <span className="btn-header cursor-default opacity-90">{label}</span>
      );
    }
    return (
      <Link
        to={to}
        className={key === 'register' || key === 'login' ? 'btn-header' : 'rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 sm:text-sm'}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-candy-50 bg-candy-mesh">
      <header className="sticky top-0 z-50 border-b border-candy-200/60 bg-candy-header shadow-candy">
        <div className="page-container flex h-14 items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-5">
          <Link to="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur sm:h-10 sm:w-10">⬡</span>
            <span className="min-w-0 truncate text-sm font-bold text-white sm:text-base">
              <span className="sm:hidden">{PLATFORM.shortName}</span>
              <span className="hidden sm:inline">{PLATFORM.shortName} — {PLATFORM.name}</span>
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            {navLink('/', 'Home', 'home')}
            {navLink('/login', 'Sign In', 'login')}
            {navLink('/register', 'Register', 'register')}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <DeveloperFooter variant="auth" />
    </div>
  );
}
