import { Outlet, Link, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      {/* Navigation */}
      <nav className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 backdrop-blur-md sticky top-0 z-50 w-full">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center no-underline group" style={{ marginLeft: '150px' }}>
            <span className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              LLD Practice
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <NavLink to="/" active={location.pathname === '/'}>
              Problems
            </NavLink>
            <NavLink
              to="/history"
              active={location.pathname === '/history'}
            >
              History
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center pt-8 pb-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 text-center text-[var(--color-text-muted)] text-sm bg-[var(--color-bg-secondary)]/50" style={{ marginTop: '150px' }}>
        LLD Practice Platform — Build better designs through practice
      </footer>
    </div >
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`text-sm font-semibold transition-colors no-underline px-4 py-2 rounded-lg ${active
        ? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
        }`}
    >
      {children}
    </Link>
  );
}
