export default function PhotosPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-brand-900">Photo module</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          The first media flow is now patient-centered. Open a patient record to upload
          before, after, and progress photos, review gallery metadata, and compare one
          BEFORE image with one AFTER image side by side.
        </p>
      </div>

      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-900">How to use it</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li>1. Open any patient details page.</li>
          <li>2. Use the Patient photos section or the Open photos action.</li>
          <li>3. Upload one or more images with shared metadata.</li>
          <li>4. Filter the gallery by category or open the comparison view.</li>
        </ol>
      </div>
    </section>
  );
}
