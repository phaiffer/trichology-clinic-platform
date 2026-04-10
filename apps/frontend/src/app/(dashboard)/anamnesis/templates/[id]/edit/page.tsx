import Link from "next/link";
import { AnamnesisTemplateForm } from "@/components/anamnesis/anamnesis-template-form";
import { getAnamnesisTemplate } from "@/lib/api";

export default async function EditAnamnesisTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const template = await getAnamnesisTemplate(params.id);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/anamnesis/templates/${template.id}`} className="text-sm font-medium text-brand-700">
            Back to template
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Edit anamnesis template
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Update template metadata, question structure, scoring settings, and
            status without changing historical patient submissions.
          </p>
        </div>

        <AnamnesisTemplateForm mode="edit" template={template} />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load template editing flow";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Back to templates
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Template editing unavailable
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
