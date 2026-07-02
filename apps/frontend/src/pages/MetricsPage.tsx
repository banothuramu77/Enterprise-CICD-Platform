const metrics = [
  { label: 'Average Build Time', value: '4m 12s', detail: 'Down 18s from last week' },
  { label: 'Queue Length', value: '8 jobs', detail: '2 waiting for deployment' },
  { label: 'Success Rate', value: '96.4%', detail: 'Healthy trend' },
  { label: 'Failure Rate', value: '3.6%', detail: 'Mostly infra-related' },
  { label: 'Active Workers', value: '4', detail: '2 online, 2 warming up' },
  { label: 'Daily Builds', value: '24', detail: 'Peak at 10:30 UTC' },
  { label: 'Monthly Builds', value: '612', detail: '+14% month over month' },
];

const trendData = [32, 41, 36, 52, 48, 61, 69];
const weeklyBuilds = [12, 16, 15, 20, 18, 24, 22];

const MetricsPage = () => {
  const points = trendData
    .map((value, index) => `${index * 46 + 16},${160 - value}`)
    .join(' ');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h2 className="text-2xl font-semibold">Analytics</h2>
        <p className="mt-2 text-sm text-slate-400">
          Review build performance, queue pressure, and team delivery health in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-cyan-400">{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-400">Build trend</p>
              <h3 className="mt-1 text-lg font-semibold">Weekly build duration overview</h3>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              Improving
            </span>
          </div>

          <svg viewBox="0 0 320 160" className="mt-6 h-48 w-full">
            {[0, 40, 80, 120, 160].map((y) => (
              <line key={y} x1="12" y1={y} x2="308" y2={y} stroke="#334155" strokeDasharray="4 4" />
            ))}
            <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {trendData.map((value, index) => {
              const x = index * 46 + 16;
              const y = 160 - value;
              return <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#f8fafc" stroke="#22d3ee" strokeWidth="2" />;
            })}
          </svg>

          <div className="mt-3 flex justify-between text-sm text-slate-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
          <p className="text-sm font-medium text-cyan-400">Daily builds</p>
          <h3 className="mt-1 text-lg font-semibold">Build volume by day</h3>

          <div className="mt-6 flex h-48 items-end gap-3">
            {weeklyBuilds.map((value, index) => (
              <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-gradient-to-t from-cyan-600 to-cyan-400" style={{ height: `${value * 4}px` }} />
                <span className="text-xs text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;
