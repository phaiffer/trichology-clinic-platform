import Link from "next/link";
import { TemplateStatusToggle } from "@/components/anamnesis/template-status-toggle";
import { canManageTemplates, requireAuthenticatedUser } from "@/lib/auth";
import { formatFlexibleNumber, formatQuestionType } from "@/lib/formatters";
import { getServerAnamnesisTemplate } from "@/lib/server-api";

export default async function AnamnesisTemplateDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const currentUser = await requireAuthenticatedUser();
    const template = await getServerAnamnesisTemplate(params.id);
    const canEditTemplates = canManageTemplates(currentUser);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
                Voltar para modelos
              </Link>
              <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
                {template.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                {template.description || "Sem descrição informada para este modelo."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  template.active
                    ? "bg-brand-50 text-brand-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {template.active ? "Ativo" : "Inativo"}
              </span>

              {canEditTemplates ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/anamnesis/templates/${template.id}/edit`}
                    className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
                  >
                    Editar modelo
                  </Link>

                  <TemplateStatusToggle
                    templateId={template.id}
                    active={template.active}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Os registros de anamnese já preenchidos preservam o nome do modelo, os
          enunciados e os pesos vigentes no momento do atendimento, mantendo a
          integridade das pontuações e dos relatórios emitidos.
        </section>

        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-900">Perguntas</h2>

          <div className="mt-6 space-y-4">
            {template.questions.map((question) => (
              <article
                key={question.id}
                className="rounded-3xl border border-brand-100 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {question.displayOrder}. {question.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {question.helperText || "Sem orientação complementar."}
                    </p>
                  </div>
                  <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                    {formatQuestionType(question.type)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>{question.required ? "Obrigatória" : "Opcional"}</span>
                  <span>
                    Peso na pontuação:{" "}
                    {question.scoringWeight === null
                      ? "Não configurado"
                      : formatFlexibleNumber(question.scoringWeight)}
                  </span>
                </div>

                {question.options.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <span
                        key={option}
                        className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
                      >
                        {option}
                        {typeof question.optionScores[option] === "number"
                          ? ` (${formatFlexibleNumber(question.optionScores[option])} pt)`
                          : ""}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar o modelo";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Voltar para modelos
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Modelo indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
