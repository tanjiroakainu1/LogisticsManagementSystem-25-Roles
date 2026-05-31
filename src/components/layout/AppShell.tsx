import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ROLE_PAGES, NAV_ICONS, getRoleLabel, getRoleFolder } from '@/config/roles';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/services';
import { DeveloperBadge, DeveloperFooter, DeveloperSidebarCredit } from '@/components/ui/DeveloperCredit';
import type { RoleKey } from '@/types';
import { useEffect, useState } from 'react';

export function AppShell({ role }: { role: RoleKey }) {
  const { user, logout } = useAuth();
  const { data, update } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pages = ROLE_PAGES[role];
  const folder = getRoleFolder(role);
  const notifs = data.notifications.filter((n) => n.user_id === user?.id && !n.is_read);
  const initials = user?.full_name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  useEffect(() => {
    const close = () => setNotifOpen(false);
    if (notifOpen) window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, [notifOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen min-w-0 flex-col">
      <nav className="sticky top-0 z-50 border-b border-candy-200/80 bg-white/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-3 sm:px-4 lg:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-candy-200 bg-candy-50 text-lg text-candy-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-candy-header text-sm text-white shadow-candy sm:h-10 sm:w-10">⬡</span>
            <div className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-candy-900 sm:text-base">LMS Portal</span>
              <span className="hidden truncate text-xs text-candy-500 md:block">{getRoleLabel(role)}</span>
            </div>
          </div>

          <span className="hidden shrink-0 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-candy sm:inline-flex sm:px-4 sm:text-xs">
            {getRoleLabel(role)}
          </span>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="relative">
              <button
                type="button"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-candy-600 hover:bg-candy-100"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
              >
                🔔
                {notifs.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-pastel-rose text-[10px] font-bold text-candy-800 ring-2 ring-white">
                    {notifs.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} aria-hidden />
                  <div className="absolute right-0 top-full z-50 mt-2 w-[min(calc(100vw-1.5rem),20rem)] rounded-2xl border border-candy-200 bg-white/95 shadow-xl backdrop-blur-md sm:w-80">
                    <div className="border-b border-candy-100 px-4 py-3 text-sm font-bold text-candy-900">Notifications</div>
                    {notifs.length === 0 ? (
                      <p className="p-4 text-sm text-candy-500">You're all caught up!</p>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="w-full border-b border-candy-100 px-4 py-2 text-left text-xs font-semibold text-primary hover:bg-candy-50"
                          onClick={() => user && update((d) => markAllNotificationsRead(d, user.id))}
                        >
                          Mark all read
                        </button>
                        {notifs.slice(0, 5).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            className="block w-full border-b border-candy-50 px-4 py-3 text-left last:border-0 hover:bg-candy-50"
                            onClick={() => update((d) => markNotificationRead(d, n.id))}
                          >
                            <strong className="block text-sm text-candy-900">{n.title}</strong>
                            <span className="line-clamp-2 text-xs text-candy-500">{n.message}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-primary">{initials}</span>
              <span className="max-w-[120px] truncate text-sm font-semibold text-candy-800 lg:max-w-none">{user?.full_name}</span>
            </div>
            <button type="button" className="btn btn-sm btn-outline !min-h-[40px] px-2 sm:px-3" onClick={() => { logout(); navigate('/login'); }}>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex min-w-0 flex-1">
        <aside
          className={`fixed inset-y-0 left-0 top-14 z-50 flex w-[min(85vw,280px)] flex-col border-r border-candy-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md transition-transform duration-300 sm:top-[72px] lg:static lg:z-auto lg:w-[268px] lg:translate-x-0 lg:shadow-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm font-bold text-primary">
              <span>⬡</span>
              <span className="truncate">{getRoleLabel(role)}</span>
            </div>
            <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-candy-200 text-candy-600" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <div className="mb-4 hidden items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm font-bold text-primary lg:flex">
            <span>⬡</span>
            <span className="truncate">{getRoleLabel(role)}</span>
          </div>
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-candy-400">Menu</p>
          <ul className="flex-1 space-y-1 overflow-y-auto pb-4">
            {Object.entries(pages).map(([key, meta]) => (
              <li key={key}>
                <NavLink
                  to={`/${folder}/${key === 'index' ? '' : key}`}
                  end={key === 'index'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary text-white shadow-candy'
                        : 'text-candy-600 hover:bg-candy-100 hover:text-candy-900'
                    }`
                  }
                >
                  <span className="shrink-0 text-lg">{NAV_ICONS[key] ?? '📄'}</span>
                  <span className="truncate">{meta.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <DeveloperSidebarCredit />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 top-14 z-40 bg-candy-900/40 backdrop-blur-[2px] sm:top-[72px] lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden />
        )}

        <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>

      <DeveloperFooter variant="app" />
    </div>
  );
}

export function PageHeader({ title, subtitle, role }: { title: string; subtitle: string; role: RoleKey }) {
  return (
    <div className="mb-4 rounded-2xl border border-candy-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:mb-6 sm:p-5 lg:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-block max-w-full truncate rounded-full bg-accent-soft px-3 py-1 text-[10px] font-bold text-primary sm:text-xs">
          ⬡ {getRoleLabel(role)}
        </span>
        <DeveloperBadge className="!py-0.5" />
      </div>
      <h1 className="section-title break-words">{title}</h1>
      <p className="section-subtitle break-words">{subtitle}</p>
    </div>
  );
}
