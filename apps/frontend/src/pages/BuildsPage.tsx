interface BuildsPageProps {
  onOpenBuild: () => void;
}

const builds = [
  { id: '1242', branch: 'main', status: 'Succeeded', duration: '4m 12s' },
  { id: '1241', branch: 'develop', status: 'Running', duration: '1m 20s' },
  { id: '1240', branch: 'release', status: 'Failed', duration: '2m 05s' },
];

const BuildsPage = ({ onOpenBuild }: BuildsPageProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Builds</h2>
        <p className="mt-2 text-sm text-slate-400">Inspect recent pipeline runs and open the details pane for each build.</p>
      </div>
      <div className="space-y-3">
        {builds.map((build) => (
          <button key={build.id} onClick={onOpenBuild} className="flex w-full flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">Build #{build.id}</p>
              <p className="text-sm text-slate-400">Branch: {build.branch}</p>
            </div>
            <div className="mt-3 sm:mt-0">
              <p className={`text-sm font-medium ${build.status === 'Succeeded' ? 'text-emerald-300' : build.status === 'Running' ? 'text-cyan-300' : 'text-rose-300'}`}>{build.status}</p>
              <p className="text-sm text-slate-400">{build.duration}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuildsPage;
