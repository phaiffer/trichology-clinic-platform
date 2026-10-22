import Link from "next/link";
import { AnamnesisTemplateForm } from "@/components/anamnesis/anamnesis-template-form";
import { requireAnyRole } from "@/lib/auth";
import { getServerAnamnesisTemplate } from "@/lib/server-api";

export default async function EditAnamnesisTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  await requireAnyRole(["ADMIN", "CLINICIAN"]);

  try {
    const template = await getServerAnamnesisTemplate(params.id);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/anamnesis/templates/${template.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o modelo
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Editar modelo de anamnese
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Atualize nome, descrição, perguntas, pesos de pontuação e status de
            disponibilidade mantendo os registros já realizados intactos.
          </p>
        </div>

        <AnamnesisTemplateForm mode="edit" template={template} />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a edição do modelo";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/anamnesis" className="text-sm font-medium text-brand-700">
          Voltar para modelos
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Edição do modelo indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
