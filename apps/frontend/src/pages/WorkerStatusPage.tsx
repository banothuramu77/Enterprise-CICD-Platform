const workers = [
  { id: 'worker-01', status: 'Online', region: 'us-east-1', load: '42%' },
  { id: 'worker-02', status: 'Online', region: 'eu-west-1', load: '78%' },
  { id: 'worker-03', status: 'Maintenance', region: 'ap-south-1', load: '12%' },
];

const WorkerStatusPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Worker Status</h2>
        <p className="mt-2 text-sm text-slate-400">Observe worker availability, location, and active load in real time.</p>
      </div>
      <div className="space-y-3">
        {workers.map((worker) => (
          <div key={worker.id} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">{worker.id}</p>
              <p className="text-sm text-slate-400">Region: {worker.region}</p>
            </div>
            <div className="mt-3 sm:mt-0">
              <p className={`text-sm font-medium ${worker.status === 'Online' ? 'text-emerald-300' : 'text-amber-300'}`}>{worker.status}</p>
              <p className="text-sm text-slate-400">Load: {worker.load}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerStatusPage;
