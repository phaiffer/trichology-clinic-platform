export default function PatientPhotosLoading() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <div className="h-4 w-28 animate-pulse rounded bg-brand-100" />
        <div className="mt-4 h-10 w-80 animate-pulse rounded bg-brand-100" />
        <div className="mt-3 h-4 w-full max-w-3xl animate-pulse rounded bg-brand-100" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <div className="h-64 animate-pulse rounded-2xl bg-brand-100" />
            <div className="mt-4 h-4 w-48 animate-pulse rounded bg-brand-100" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-brand-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
