import Link from "next/link";

export default function PhotosPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Acompanhamento visual
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Módulo de fotos clínicas
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          O gerenciamento de imagens clínicas é organizado por paciente. Acesse um
          prontuário para enviar fotos de antes, depois e evolução, consultar metadados
          da galeria e comparar imagens lado a lado.
        </p>
        <div className="mt-6">
          <Link
            href="/patients"
            className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Abrir pacientes
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-900">Como utilizar</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li>1. Abra a página de detalhes de qualquer paciente cadastrado.</li>
          <li>2. Acesse a seção Fotos do paciente ou clique em Abrir fotos.</li>
          <li>3. Envie uma ou mais imagens (JPEG, PNG ou WebP) com data e observações.</li>
          <li>
            4. Filtre a galeria por categoria (Antes, Depois, Evolução) ou abra a
            comparação lado a lado.
          </li>
        </ol>
      </div>
    </section>
  );
}
