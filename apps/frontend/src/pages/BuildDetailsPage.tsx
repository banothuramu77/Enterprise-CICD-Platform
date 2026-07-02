const BuildDetailsPage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Build details</p>
        <h2 className="mt-2 text-2xl font-semibold">Build #1242</h2>
        <p className="mt-2 text-sm text-slate-400">Repository: demo-app • Branch: main • Status: succeeded</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold">Build log</h3>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-300">
{`[12:03:11] Starting container
[12:03:18] Cloning repository
[12:03:40] Installing dependencies
[12:03:58] Running tests
[12:04:22] Build completed successfully`}
          </pre>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold">Summary</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Duration: 4m 12s</li>
            <li>Artifacts: dist/app.js</li>
            <li>Triggered by: webhook</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BuildDetailsPage;
