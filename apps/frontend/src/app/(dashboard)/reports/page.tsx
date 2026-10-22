import Link from "next/link";

export default function ReportsPage() {
  return (
    <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
        Documentação clínica
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
        Relatórios em PDF
      </h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        A geração de relatórios clínicos em PDF é vinculada ao prontuário de cada
        paciente. Abra um paciente para consolidar dados cadastrais, respostas de
        anamnese, pontuação capilar e fotos selecionadas em um documento pronto para
        impressão ou download.
      </p>
      <div className="mt-6">
        <Link
          href="/patients"
          className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
        >
          Abrir pacientes
        </Link>
      </div>
    </section>
  );
}
