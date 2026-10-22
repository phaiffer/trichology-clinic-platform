import Link from "next/link";
import { getServerPatient } from "@/lib/server-api";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientInput } from "@/lib/types";

type EditPatientPageProps = {
  params: {
    id: string;
  };
};

function toPatientInput(
  patient: Awaited<ReturnType<typeof getServerPatient>>,
): PatientInput {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    birthDate: patient.birthDate,
    gender: patient.gender,
    notes: patient.notes,
    consentAccepted: patient.consentAccepted,
    active: patient.active,
  };
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  try {
    const patient = await getServerPatient(params.id);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para detalhes
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Editar paciente
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Atualize os dados cadastrais do paciente mantendo o histórico clínico e o
            consentimento consistentes.
          </p>
        </div>

        <PatientForm
          mode="edit"
          patientId={patient.id}
          initialValues={toPatientInput(patient)}
        />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar o paciente";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link href="/patients" className="text-sm font-medium text-brand-700">
            Voltar para pacientes
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Paciente indisponível
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}
