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
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Back to patient
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Start anamnesis
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Select a template and capture the structured intake answers for this
            patient.
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
      error instanceof Error ? error.message : "Unable to load anamnesis entry";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
          Back to patient
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Unable to start anamnesis
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
