import Link from "next/link";
import { requireAnyRole } from "@/lib/auth";

export default async function ScoringPage() {
  await requireAnyRole(["ADMIN", "CLINICIAN"]);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Avaliação quantitativa
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Pontuação clínica capilar
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          O cálculo de pontuação é realizado diretamente no prontuário de cada
          paciente a partir de um registro de anamnese salvo, gerando a classificação de
          risco e a contribuição detalhada de cada resposta.
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
        <h2 className="text-lg font-semibold text-brand-900">Como funciona hoje</h2>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          <li>
            1. Configure pesos e pontuações das opções nas perguntas do modelo de
            anamnese.
          </li>
          <li>
            2. Abra a ficha do paciente e preencha um novo registro de anamnese.
          </li>
          <li>
            3. Na visualização do registro, acione o cálculo de pontuação para gerar o
            escore total, a classificação (Baixo, Moderado ou Alto) e a memória de
            cálculo por pergunta.
          </li>
          <li>
            4. Vincule o resultado calculado na emissão do relatório clínico em PDF.
          </li>
        </ol>
      </div>
    </section>
  );
}
