import { StatDef } from '@/types';
import { DEVELOPER } from '@/config/brand';

const icons = ['📊', '📦', '✅', '⚡', '🚛', '👥', '💰', '🔔'];
const accentBars = [
  'from-pastel-lavender to-accent-soft',
  'from-pastel-rose to-pastel-peach',
  'from-pastel-mint to-pastel-sky',
  'from-pastel-sky to-pastel-lavender',
  'from-pastel-peach to-pastel-lemon',
  'from-pastel-lemon to-pastel-mint',
  'from-accent-soft to-pastel-rose',
  'from-pastel-lavender to-pastel-mint',
];

export function StatGrid({ stats, values }: { stats: StatDef[]; values: Record<string, string | number> }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:gap-4 lg:grid-cols-4">
      {stats.map((s, i) => (
        <div key={s.key} className="stat-candy">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accentBars[i % accentBars.length]}`} />
          <div className="mb-2 flex items-start justify-between gap-2 sm:mb-3">
            <span className="text-[10px] font-bold uppercase leading-tight tracking-wide text-candy-500 sm:text-xs">{s.label}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-candy-100 text-base sm:h-9 sm:w-9 sm:text-lg">{icons[i % icons.length]}</span>
          </div>
          <div className="truncate text-xl font-extrabold tracking-tight text-candy-900 sm:text-2xl lg:text-3xl">
            {values[s.key] ?? '—'}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WelcomeBanner({ name, roleLabel }: { name: string; roleLabel: string }) {
  return (
    <div className="mb-4 rounded-2xl bg-candy-banner p-4 text-white shadow-glow sm:mb-6 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold sm:text-xl lg:text-2xl">Welcome back, {name}</h2>
          <p className="mt-1 text-sm text-white/85 sm:text-base">Your {roleLabel} workspace — manage operations, track progress, and collaborate across the logistics network.</p>
        </div>
        <div className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center backdrop-blur-sm sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Platform by</p>
          <p className="text-sm font-extrabold">{DEVELOPER.name}</p>
          <p className="text-[10px] font-semibold text-white/80">{DEVELOPER.role}</p>
        </div>
      </div>
    </div>
  );
}
