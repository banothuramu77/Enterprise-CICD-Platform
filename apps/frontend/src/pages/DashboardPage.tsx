interface DashboardPageProps {
  onNavigate: (page: 'dashboard' | 'repositories' | 'builds' | 'build-details' | 'metrics' | 'workers') => void;
}

const statCards = [
  { label: 'Active Builds', value: '24', detail: '+8% from last week' },
  { label: 'Successful Deploys', value: '189', detail: '98.4% success rate' },
  { label: 'Worker Health', value: '12/12', detail: 'All workers online' },
];

const DashboardPage = ({ onNavigate }: DashboardPageProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Delivery overview</p>
        <h2 className="mt-2 text-3xl font-semibold">Continuous delivery at a glance</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">Monitor repository health, track build throughput, and inspect the worker fleet from one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-cyan-400">{card.detail}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent activity</h3>
            <button onClick={() => onNavigate('builds')} className="text-sm text-cyan-400">View all</button>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="rounded-xl bg-slate-800/70 px-3 py-2">Build #1242 completed successfully for main</li>
            <li className="rounded-xl bg-slate-800/70 px-3 py-2">Worker node-2 reported a heartbeat delay</li>
            <li className="rounded-xl bg-slate-800/70 px-3 py-2">Repository demo-app was connected successfully</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold">Quick actions</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => onNavigate('repositories')} className="rounded-xl bg-slate-800 px-4 py-3 text-sm text-slate-200">Manage repositories</button>
            <button onClick={() => onNavigate('builds')} className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-medium text-slate-950">Open builds</button>
            <button onClick={() => onNavigate('workers')} className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200">Inspect workers</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
