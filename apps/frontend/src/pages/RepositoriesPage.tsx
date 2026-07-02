const repositories = [
  { name: 'demo-app', owner: 'octo', branch: 'main', health: 'Healthy' },
  { name: 'api-service', owner: 'octo', branch: 'develop', health: 'Warning' },
  { name: 'shared-lib', owner: 'octo', branch: 'release', health: 'Healthy' },
];

const RepositoriesPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Repositories</h2>
        <p className="mt-2 text-sm text-slate-400">Connect and manage the source repositories your build pipeline watches.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {repositories.map((repo) => (
          <div key={repo.name} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{repo.name}</h3>
                <p className="text-sm text-slate-400">{repo.owner}/{repo.name}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${repo.health === 'Healthy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {repo.health}
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-400">Default branch: {repo.branch}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositoriesPage;
