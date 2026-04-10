import Link from "next/link";

export default function ReportsPage() {
  return (
    <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-brand-900">Reports</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Clinical PDF generation is now patient-centered. Open a patient record to
        generate, review, and manage local report files.
      </p>
      <div className="mt-6">
        <Link
          href="/patients"
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          Open patients
        </Link>
      </div>
    </section>
  );
}
