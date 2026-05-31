import { Link } from 'react-router-dom';
import { PLATFORM, DEVELOPER } from '@/config/brand';
import { ALL_ROLE_KEYS, DEMO_PASSWORD, getRoleLabel, ROLES } from '@/config/roles';
import { HOME_STATS, PLATFORM_FEATURES, SHIPMENT_FLOW } from '@/config/homeFlow';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DeveloperBadge, DeveloperShowcase } from '@/components/ui/DeveloperCredit';

export default function HomePage() {
  return (
    <PublicLayout active="home">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-candy-200/60">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pastel-lavender/30 via-transparent to-pastel-mint/25" aria-hidden />
        <div className="page-container relative px-3 py-10 sm:px-5 sm:py-14 lg:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <DeveloperBadge className="mb-4 !inline-flex" />
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-accent sm:text-sm">
              Welcome · Guest Portal
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-candy-900 sm:text-4xl lg:text-5xl">
              Move logistics forward with{' '}
              <span className="dev-shimmer">one connected platform</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-candy-600 sm:text-lg">
              {PLATFORM.name} links {PLATFORM.roles} roles across the full shipment lifecycle —
              from customer request to final delivery and invoicing. Explore the flow below, then sign in to any demo role.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/login" className="btn btn-primary min-w-[180px] px-8 shadow-glow">
                Sign In to Demo
              </Link>
              <Link to="/register" className="btn btn-outline min-w-[180px] bg-white/80 px-8">
                Create Account
              </Link>
            </div>
            <p className="mt-4 text-sm text-candy-500">
              Demo password for all roles: <strong className="text-primary">{DEMO_PASSWORD}</strong>
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {HOME_STATS.map((s) => (
              <div key={s.label} className="stat-candy text-center">
                <div className="text-2xl font-extrabold text-candy-900 sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-candy-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipment flow */}
      <section className="page-container px-3 py-10 sm:px-5 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="section-title">How the shipment flow works</h2>
          <p className="section-subtitle mx-auto max-w-2xl">
            Every demo shipment (e.g. <strong className="text-candy-700">LMSDEMO001</strong>) moves through these stages.
            Each step is handled by a dedicated role — switch roles to continue the pipeline.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-4 top-0 hidden h-full w-0.5 bg-gradient-to-b from-accent-soft via-pastel-lavender to-pastel-mint sm:left-1/2 sm:block sm:-translate-x-px" aria-hidden />
          <ol className="space-y-4 sm:space-y-6">
            {SHIPMENT_FLOW.map((item, i) => (
              <li
                key={item.step}
                className={`relative flex flex-col gap-3 sm:flex-row sm:items-center ${
                  i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                <div className={`min-w-0 flex-1 ${i % 2 === 0 ? 'sm:pr-8 sm:text-right' : 'sm:pl-8 sm:text-left'}`}>
                  <div className={`candy-surface p-4 sm:p-5 ${i % 2 === 0 ? 'sm:ml-auto sm:max-w-md' : 'sm:mr-auto sm:max-w-md'}`}>
                    <span className="mb-2 inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      Step {item.step}
                    </span>
                    <h3 className="text-base font-extrabold text-candy-900 sm:text-lg">
                      {item.icon} {item.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-accent">{item.role}</p>
                    <p className="mt-2 text-sm text-candy-600">{item.detail}</p>
                  </div>
                </div>

                <div className="relative z-10 mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-accent-light bg-white text-sm font-extrabold text-primary shadow-candy sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                  {item.step}
                </div>

                <div className="hidden min-w-0 flex-1 sm:block" aria-hidden />
              </li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-dashed border-accent-light/50 bg-accent-soft/40 p-4 text-center text-sm text-candy-700 sm:p-5">
          <strong>Try it:</strong> Log in as <em>Customer</em> to create a shipment → switch to{' '}
          <em>Shipment Coordinator</em> → <em>Packing Staff</em> → <em>QA</em> → <em>Dispatcher</em> →{' '}
          <em>Driver</em> → <em>Finance Officer</em>. All changes sync live for every role.
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-candy-200/60 bg-white/50 py-10 sm:py-14">
        <div className="page-container px-3 sm:px-5">
          <div className="mb-8 text-center">
            <h2 className="section-title">Platform highlights</h2>
            <p className="section-subtitle">Everything you need to explore a full logistics operation</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="candy-surface p-5 transition hover:shadow-glow">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-base font-extrabold text-candy-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-candy-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles preview */}
      <section className="page-container px-3 py-10 sm:px-5 sm:py-14">
        <div className="mb-8 text-center">
          <h2 className="section-title">All {PLATFORM.roles} roles</h2>
          <p className="section-subtitle">Sign in to explore any role instantly from the login page</p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ALL_ROLE_KEYS.map((role) => (
            <Link
              key={role}
              to="/login"
              className="flex min-h-[64px] items-center gap-3 rounded-xl border border-candy-200/80 bg-candy-50/50 p-3 transition hover:border-accent-light hover:bg-accent-soft/50 hover:shadow-candy"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pastel-lavender to-pastel-mint text-lg">
                {ROLES[role].icon}
              </span>
              <span className="min-w-0 truncate text-sm font-bold text-candy-900">{getRoleLabel(role)}</span>
              <span className="ml-auto shrink-0 text-accent">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Developer + CTA */}
      <section className="page-container px-3 pb-10 sm:px-5 sm:pb-14">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <DeveloperShowcase />
          <div className="flex flex-col justify-center rounded-2xl bg-candy-banner p-6 text-white shadow-glow sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70">Built by</p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">{DEVELOPER.name}</h2>
            <p className="mt-1 font-semibold text-white/90">{DEVELOPER.role}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/85">{DEVELOPER.quote}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="btn bg-white text-primary-dark hover:bg-candy-100">
                Enter Platform
              </Link>
              <Link to="/register" className="btn border border-white/40 bg-white/10 text-white hover:bg-white/20">
                Join Network
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
