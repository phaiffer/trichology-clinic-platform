import Link from "next/link";
import { getServerAnamnesisTemplates, getServerPatient } from "@/lib/server-api";
import { PatientAnamnesisForm } from "@/components/anamnesis/patient-anamnesis-form";

export default async function NewPatientAnamnesisPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { templateId?: string };
}) {
  try {
    const [patient, templates] = await Promise.all([
      getServerPatient(params.id),
      getServerAnamnesisTemplates(),
    ]);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Iniciar anamnese
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Selecione um modelo ativo e registre as respostas estruturadas da avaliação
            para este paciente.
          </p>
        </div>

        <PatientAnamnesisForm
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          templates={templates.filter((template) => template.active)}
          initialTemplateId={searchParams?.templateId}
        />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o formulário de anamnese";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href={`/patients/${params.id}`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para o paciente
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Não foi possível iniciar a anamnese
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
