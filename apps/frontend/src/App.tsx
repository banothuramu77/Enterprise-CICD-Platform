import { useMemo, useState } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RepositoriesPage from './pages/RepositoriesPage';
import BuildsPage from './pages/BuildsPage';
import BuildDetailsPage from './pages/BuildDetailsPage';
import MetricsPage from './pages/MetricsPage';
import WorkerStatusPage from './pages/WorkerStatusPage';

const App = () => {
  const [activePage, setActivePage] = useState<'login' | 'dashboard' | 'repositories' | 'builds' | 'build-details' | 'metrics' | 'workers'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const page = useMemo(() => {
    if (!isAuthenticated) {
      return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
    }

    switch (activePage) {
      case 'repositories':
        return <RepositoriesPage />;
      case 'builds':
        return <BuildsPage onOpenBuild={() => setActivePage('build-details')} />;
      case 'build-details':
        return <BuildDetailsPage />;
      case 'metrics':
        return <MetricsPage />;
      case 'workers':
        return <WorkerStatusPage />;
      case 'dashboard':
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  }, [activePage, isAuthenticated]);

  return <Layout activePage={activePage} onNavigate={setActivePage} isAuthenticated={isAuthenticated} onLogout={() => setIsAuthenticated(false)}>{page}</Layout>;
};

export default App;
