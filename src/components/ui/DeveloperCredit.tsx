import { DEVELOPER, PLATFORM } from '@/config/brand';

const stackIcons = ['⚛️', '📘', '🎨', '⚡'];

/** Compact pill — page headers & inline mentions */
export function DeveloperBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`dev-badge inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent-light/40 bg-gradient-to-r from-pastel-lavender/80 via-white to-pastel-mint/80 px-2.5 py-1 text-[10px] font-bold text-candy-700 shadow-candy sm:gap-2 sm:px-3 sm:text-xs ${className}`}
      title={`${DEVELOPER.role}: ${DEVELOPER.name}`}
    >
      <span className="dev-shimmer shrink-0">✦</span>
      <span className="truncate">
        <span className="text-candy-500">{DEVELOPER.role}</span>
        <span className="mx-1 text-candy-300">·</span>
        <span className="dev-shimmer text-primary">{DEVELOPER.name}</span>
      </span>
    </span>
  );
}

/** Sidebar bottom strip — visible on every role page */
export function DeveloperSidebarCredit() {
  return (
    <div className="dev-sidebar mt-auto rounded-2xl border border-candy-200/80 bg-gradient-to-br from-candy-50 via-white to-accent-soft/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="dev-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-candy-header text-xs font-extrabold text-white shadow-candy">
          {DEVELOPER.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-candy-900">{DEVELOPER.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">{DEVELOPER.role}</p>
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-candy-500">{DEVELOPER.tagline}</p>
    </div>
  );
}

/** Hero showcase — login page & settings */
export function DeveloperShowcase({ className = '' }: { className?: string }) {
  return (
    <div className={`dev-showcase relative overflow-hidden rounded-2xl p-[1px] ${className}`}>
      <div className="dev-glow-ring absolute inset-0 rounded-2xl opacity-80" aria-hidden />
      <div className="relative rounded-[15px] bg-gradient-to-br from-white via-candy-50 to-accent-soft/30 p-4 sm:p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-pastel-lavender/50 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-pastel-mint/50 blur-2xl" aria-hidden />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="dev-avatar flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-candy-header text-xl font-extrabold text-white shadow-glow sm:h-[72px] sm:w-[72px] sm:text-2xl">
            {DEVELOPER.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent sm:text-xs">
              ✦ Crafted with passion ✦
            </p>
            <h3 className="text-lg font-extrabold tracking-tight text-candy-900 sm:text-xl">
              {DEVELOPER.name}
            </h3>
            <p className="text-sm font-semibold text-primary">{DEVELOPER.role}</p>
            <p className="mt-2 text-xs italic leading-relaxed text-candy-600 sm:text-sm">
              &ldquo;{DEVELOPER.quote}&rdquo;
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-2 border-t border-candy-200/60 pt-4">
          {DEVELOPER.stack.map((tech, i) => (
            <span
              key={tech}
              className="inline-flex items-center gap-1 rounded-full border border-candy-200/80 bg-white/80 px-2.5 py-1 text-[10px] font-bold text-candy-700 sm:text-xs"
            >
              <span>{stackIcons[i % stackIcons.length]}</span>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Global footer — AppShell, Login, Register */
export function DeveloperFooter({ variant = 'app' }: { variant?: 'app' | 'auth' }) {
  const year = new Date().getFullYear();
  const isAuth = variant === 'auth';

  return (
    <footer
      className={`dev-footer border-t text-center backdrop-blur-sm ${
        isAuth
          ? 'border-candy-200/60 bg-white/60 px-4 py-5 sm:py-6'
          : 'border-candy-200/80 bg-white/70 px-4 py-4 sm:py-6'
      }`}
    >
      <div className="page-container space-y-3">
        <p className={`font-bold text-candy-800 ${isAuth ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
          {PLATFORM.name}
        </p>
        <p className="text-[11px] text-candy-500 sm:text-xs">
          © {year} · {PLATFORM.tagline}
        </p>

        <div className="dev-footer-credit mx-auto inline-flex max-w-full flex-col items-center gap-2 rounded-2xl border border-accent-light/30 bg-gradient-to-r from-pastel-lavender/40 via-white/90 to-pastel-mint/40 px-4 py-3 shadow-candy sm:flex-row sm:gap-3 sm:px-5">
          <span className="dev-shimmer text-[10px] font-bold uppercase tracking-[0.15em] text-accent sm:text-xs">
            ✦ Developer ✦
          </span>
          <span className="hidden h-4 w-px bg-candy-200 sm:block" aria-hidden />
          <span className="truncate text-sm font-extrabold text-candy-900">{DEVELOPER.name}</span>
          <span className="hidden text-candy-400 sm:inline">·</span>
          <span className="hidden text-xs text-candy-500 sm:inline">{DEVELOPER.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
