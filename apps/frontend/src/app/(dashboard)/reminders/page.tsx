import Link from "next/link";

export default function RemindersPage() {
  return (
    <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
        Acompanhamento
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
        Lembretes e retorno clínico
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        O acompanhamento de retornos e revisões capilares é realizado diretamente pelo
        histórico de registros de cada paciente (anamneses, evolução fotográfica e
        relatórios emitidos), respeitando o status de consentimento LGPD registrado no
        cadastro.
      </p>
      <div className="mt-6">
        <Link
          href="/patients"
          className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          Consultar prontuários de pacientes
        </Link>
      </div>
    </section>
  );
}
