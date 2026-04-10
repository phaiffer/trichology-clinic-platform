import Link from "next/link";
import { getAnamnesisTemplate } from "@/lib/api";

export default async function AnamnesisTemplateDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const template = await getAnamnesisTemplate(params.id);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
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
