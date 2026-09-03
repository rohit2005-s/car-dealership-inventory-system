import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const navLinkClasses =
  'text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          <span className="text-brand-500">🚗</span>
          <span>AutoHaus</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className={navLinkClasses}>
            Inventory
          </Link>

          {isAuthenticated && (
            <Link to="/purchases" className={navLinkClasses}>
              My Purchases
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" className={navLinkClasses}>
              Admin
            </Link>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg border border-neutral-200 px-2 py-1 text-sm dark:border-neutral-700"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {user?.name}
              </span>

              <button onClick={handleLogout} className="btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline">
                Login
              </Link>

              <Link to="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="inline-flex items-center justify-center rounded-lg border border-neutral-200 p-2 md:hidden dark:border-neutral-700"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <span className="block h-0.5 w-5 bg-current" />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 px-4 py-3 md:hidden dark:border-neutral-800">
          <div className="flex flex-col gap-3">
            <Link to="/" className={navLinkClasses} onClick={closeMobile}>
              Inventory
            </Link>

            {isAuthenticated && (
              <Link
                to="/purchases"
                className={navLinkClasses}
                onClick={closeMobile}
              >
                My Purchases
              </Link>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className={navLinkClasses}
                onClick={closeMobile}
              >
                Admin
              </Link>
            )}

            <button onClick={toggleTheme} className="self-start text-sm">
              {dark ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="btn-outline self-start"
              >
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="btn-outline"
                  onClick={closeMobile}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn-primary"
                  onClick={closeMobile}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}