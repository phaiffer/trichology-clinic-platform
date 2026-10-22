export default function PatientsLoading() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Pacientes
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Carregando prontuários de pacientes
        </h1>
        <p className="mt-3 text-slate-500">
          Consultando a lista de pacientes no servidor da clínica.
        </p>
      </div>
    </section>
  );
}
