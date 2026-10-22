import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getOptionalAuthenticatedUser } from "@/lib/auth";

export default async function LoginPage() {
  const currentUser = await getOptionalAuthenticatedUser();

  if (currentUser) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-brand-900/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-brand-900 p-8 text-white sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-100">
            PhaifferTech
          </p>
          <h1 className="mt-6 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
            Cuidado tricológico com organização clínica e rastreabilidade em cada etapa.
          </h1>
          <p className="mt-6 max-w-lg text-base text-brand-100/90">
            Centralize prontuários de pacientes, modelos dinâmicos de anamnese, cálculo
            estruturado de pontuação capilar, registro fotográfico e emissão de laudos
            em PDF.
          </p>
        </section>

        <section className="p-8 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Acesso
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-900">Entrar</h2>
            <p className="mt-3 text-sm text-slate-500">
              Utilize sua conta da clínica para acessar os fluxos protegidos de
              pacientes, anamnese, fotos, pontuação e relatórios.
            </p>

            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
