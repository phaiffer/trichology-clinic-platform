import Link from "next/link";
import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href="/patients" className="text-sm font-medium text-brand-700">
          Back to patients
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Create patient
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          The first patient form already validates essential identity and consent data
          before sending it to the backend.
        </p>
      </div>

      <PatientForm mode="create" />
    </section>
  );
}
