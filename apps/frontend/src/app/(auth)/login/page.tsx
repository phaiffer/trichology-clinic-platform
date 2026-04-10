import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalAuthenticatedUser } from "@/lib/auth";

export default async function LoginPage() {
  const currentUser = await getOptionalAuthenticatedUser();

  if (currentUser) {
    redirect("/");
  }

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
              Use your clinic account to access protected patient, anamnesis, media,
              and report workflows.
            </p>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
