const cards = [
  {
    title: "Patient management",
    description: "Register, update, and track core patient records with consent-aware fields.",
  },
  {
    title: "Dynamic anamnesis",
    description: "Prepare templated questionnaires that can evolve by evaluation workflow.",
  },
  {
    title: "Clinical scoring",
    description: "Reserve a clear module boundary for future trichology score rules.",
  },
  {
    title: "Media and reports",
    description: "Organize before and after photos, then generate PDF outputs safely.",
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Overview
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Trichology clinic operations
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          This first version focuses on solid foundations: local execution,
          maintainable modules, prepared security hooks, and an initial patient flow
          that already connects to the backend.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-[1.75rem] border border-brand-100 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-brand-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
