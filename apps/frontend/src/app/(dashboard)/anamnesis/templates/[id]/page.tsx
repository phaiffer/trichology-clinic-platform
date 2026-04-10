import Link from "next/link";
import { TemplateStatusToggle } from "@/components/anamnesis/template-status-toggle";
import { canManageTemplates, requireAuthenticatedUser } from "@/lib/auth";
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
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
                Back to templates
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-brand-900">
                {template.name}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                {template.description || "No template description provided."}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  template.active
                    ? "bg-brand-50 text-brand-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {template.active ? "Active" : "Inactive"}
              </span>

              {canEditTemplates ? (
                <>
                  <Link
                    href={`/anamnesis/templates/${template.id}/edit`}
                    className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
                  >
                    Edit template
                  </Link>

                  <TemplateStatusToggle templateId={template.id} active={template.active} />
                </>
              ) : null}
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Template edits apply to future anamnesis usage only. Existing patient
          answers, stored scores, and generated reports stay historically stable.
        </section>

        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-900">Questions</h2>

          <div className="mt-6 space-y-4">
            {template.questions.map((question) => (
              <article
                key={question.id}
                className="rounded-3xl border border-brand-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {question.displayOrder}. {question.label}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {question.helperText || "No helper text."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {question.type}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>{question.required ? "Required" : "Optional"}</span>
                  <span>
                    Scoring weight:{" "}
                    {question.scoringWeight === null ? "Not set" : question.scoringWeight}
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
                          ? ` (${question.optionScores[option]})`
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
      error instanceof Error ? error.message : "Unable to load template";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Back to templates
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Template not available
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
