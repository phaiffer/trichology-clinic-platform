import Link from "next/link";
import { AnamnesisTemplateForm } from "@/components/anamnesis/anamnesis-template-form";
import { requireAnyRole } from "@/lib/auth";

export default async function NewAnamnesisTemplatePage() {
  await requireAnyRole(["ADMIN", "CLINICIAN"]);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Voltar para modelos
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Criar modelo de anamnese
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Defina a estrutura de perguntas, obrigatoriedade, opções e pesos de pontuação
          para uso nos atendimentos clínicos.
        </p>
      </div>

      <AnamnesisTemplateForm />
    </section>
  );
}
