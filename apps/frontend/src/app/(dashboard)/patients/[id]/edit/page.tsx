import Link from "next/link";
import { getPatient } from "@/lib/api";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientInput } from "@/lib/types";

type EditPatientPageProps = {
  params: {
    id: string;
  };
};

function toPatientInput(patient: Awaited<ReturnType<typeof getPatient>>): PatientInput {
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
    const patient = await getPatient(params.id);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Back to details
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Edit patient
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Update the core patient record while keeping the current consent and
            contact data consistent.
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
      error instanceof Error ? error.message : "Unable to load patient";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href="/patients" className="text-sm font-medium text-brand-700">
            Back to patients
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Patient not available
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}

