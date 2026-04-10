import Link from "next/link";
import { AnamnesisTemplateForm } from "@/components/anamnesis/anamnesis-template-form";

export default function NewAnamnesisTemplatePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Back to templates
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Create anamnesis template
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Define the reusable structure of a clinical intake form without hardcoding
          it into the patient flow.
        </p>
      </div>

      <AnamnesisTemplateForm />
    </section>
  );
}

