import { requireAnyRole } from "@/lib/auth";

export default async function ScoringPage() {
  await requireAnyRole(["ADMIN", "CLINICIAN"]);

  return (
    <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-brand-900">Scoring</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Placeholder for trichology-specific scoring engines, rule versioning, and
        interpretable clinical result views.
      </p>
    </section>
  );
}
