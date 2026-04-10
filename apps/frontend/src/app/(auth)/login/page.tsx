import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-brand-900/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-brand-900 p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-100">
            Phaiffer Tech
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
            Trichology care with stronger clinical organization and safer data flow.
          </h1>
          <p className="mt-6 max-w-lg text-base text-brand-100/90">
            This starter favors a local-first setup, clear security boundaries, and a
            path to evolve into a production-grade clinic platform.
          </p>
        </section>

        <section className="p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Access
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-900">Sign in</h2>
            <p className="mt-3 text-sm text-slate-500">
              Authentication is scaffolded for future Spring Security integration.
            </p>

            <form className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  placeholder="doctor@clinic.com"
                  className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  placeholder="password"
                  className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
                />
              </label>

              <Link
                href="/"
                className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Enter dashboard
              </Link>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
