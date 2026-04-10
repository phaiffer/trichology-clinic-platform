import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-2xl rounded-[2rem] border border-brand-100 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Authorization
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Access restricted
        </h1>
        <p className="mt-4 text-slate-600">
          Your account is authenticated, but it does not have permission to open this
          area of the clinical workspace.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
