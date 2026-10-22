import Link from "next/link";
import { canManageTemplates, requireAuthenticatedUser } from "@/lib/auth";
import { formatDate } from "@/lib/formatters";
import { getServerAnamnesisTemplates } from "@/lib/server-api";

export default async function AnamnesisTemplatesPage() {
  try {
    const currentUser = await requireAuthenticatedUser();
    const templates = await getServerAnamnesisTemplates();
    const canCreateTemplates = canManageTemplates(currentUser);

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Anamnese
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
              Modelos dinâmicos de anamnese
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Gerencie os questionários clínicos reutilizáveis que estruturam a coleta
              de respostas dos pacientes e o cálculo de pontuação capilar.
            </p>
          </div>

          {canCreateTemplates ? (
            <Link
              href="/anamnesis/templates/new"
              className="inline-flex self-start rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 md:self-auto"
            >
              Novo modelo
            </Link>
          ) : null}
        </div>

        {templates.length === 0 ? (
          <section className="rounded-[2rem] border border-brand-100 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Nenhum modelo de anamnese cadastrado ainda. Crie o primeiro modelo para
            iniciar as avaliações clínicas.
          </section>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {templates.map((template) => (
              <article
                key={template.id}
                className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-brand-900">
                      {template.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {template.description || "Sem descrição informada para este modelo."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      template.active
                        ? "bg-brand-50 text-brand-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {template.active ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {template.questions.length}{" "}
                    {template.questions.length === 1 ? "pergunta" : "perguntas"}
                  </span>
                  <span>Criado em {formatDate(template.createdAt)}</span>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/anamnesis/templates/${template.id}`}
                    className="font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Abrir modelo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar os modelos de anamnese";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-brand-900 sm:text-3xl">Anamnese</h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
