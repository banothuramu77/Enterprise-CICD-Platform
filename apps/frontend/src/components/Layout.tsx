import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activePage: 'login' | 'dashboard' | 'repositories' | 'builds' | 'build-details' | 'metrics' | 'workers';
  isAuthenticated: boolean;
  onNavigate: (page: 'dashboard' | 'repositories' | 'builds' | 'build-details' | 'metrics' | 'workers') => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'repositories', label: 'Repositories' },
  { id: 'builds', label: 'Builds' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'workers', label: 'Worker Status' },
] as const;

const Layout = ({ children, activePage, isAuthenticated, onNavigate, onLogout }: LayoutProps) => {
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-900/70 p-6 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Enterprise CI/CD</p>
            <h1 className="mt-2 text-2xl font-semibold">Operations Console</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as LayoutProps['activePage'])}
                className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition ${activePage === item.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} className="mt-8 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800">
            Logout
          </button>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
