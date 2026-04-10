import Link from "next/link";
import { getAnamnesisTemplates } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US").format(new Date(value));
}

export default async function AnamnesisTemplatesPage() {
  try {
    const templates = await getAnamnesisTemplates();

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Anamnesis
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-900">
              Dynamic intake templates
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Manage reusable anamnesis templates that can later power patient intake,
              scoring, and structured clinical workflows.
            </p>
          </div>

          <Link
            href="/anamnesis/templates/new"
            className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            New template
          </Link>
        </div>

        {templates.length === 0 ? (
          <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm text-sm text-slate-500">
            No anamnesis templates yet. Create the first template to enable patient
            intake.
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
                      {template.description || "No template description provided."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      template.active
                        ? "bg-brand-50 text-brand-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {template.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                  <span>{template.questions.length} questions</span>
                  <span>Created {formatDate(template.createdAt)}</span>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/anamnesis/templates/${template.id}`}
                    className="font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Open template
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
      error instanceof Error ? error.message : "Unable to load anamnesis templates";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-brand-900">Anamnesis</h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}

