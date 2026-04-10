export default function PatientLoading() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Patients
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">
          Loading patient details
        </h1>
        <p className="mt-3 text-slate-500">
          Fetching the selected patient from the local API.
        </p>
      </div>
    </section>
  );
}

