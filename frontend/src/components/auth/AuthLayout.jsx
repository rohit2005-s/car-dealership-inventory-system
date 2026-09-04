/**
 * Shared visual shell for auth pages: a branded hero panel on desktop
 * (hidden on smaller screens to keep the form the priority on mobile) and a
 * centered form card. Both Login and Register compose this so the two pages
 * never drift visually out of sync with each other.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Hero / brand panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-neutral-900 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(200,149,31,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(200,149,31,0.15), transparent 45%)',
          }}
        />

        <div className="relative z-10">
          <span className="text-2xl font-bold tracking-tight text-white">
            <span className="text-brand-400">🚗</span> AutoHaus
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Premium vehicles.
            <br />
            Trusted history.
            <br />
            Instant access.
          </h2>

          <p className="mt-4 text-neutral-300">
            Browse a curated inventory, track every purchase, and manage your
            dealership account — all in one place.
          </p>
        </div>

        <p className="relative z-10 text-sm text-neutral-500">
          © {new Date().getFullYear()} AutoHaus. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950 sm:px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="card p-6 sm:p-8">{children}</div>

          {footer && (
            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}