import Link from "next/link";
import { PatientForm } from "@/components/patients/patient-form";

export default function NewPatientPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/patients" className="text-sm font-medium text-brand-700">
          Voltar para pacientes
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Cadastrar paciente
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Preencha os dados de identificação, contato e consentimento LGPD para iniciar
          o prontuário tricológico.
        </p>
      </div>

      <PatientForm mode="create" />
    </section>
  );
}
