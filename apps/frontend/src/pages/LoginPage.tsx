interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Secure access</p>
        <h2 className="mt-3 text-3xl font-semibold">Welcome back</h2>
        <p className="mt-3 text-sm text-slate-400">Access your CI/CD console, inspect builds, and monitor workers.</p>
        <div className="mt-8 space-y-3">
          <label className="block text-sm text-slate-300">
            Email
            <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none ring-0" placeholder="admin@example.com" />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input type="password" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none ring-0" placeholder="••••••••" />
          </label>
        </div>
        <button onClick={onLogin} className="mt-8 w-full rounded-xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400">
          Sign in
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
