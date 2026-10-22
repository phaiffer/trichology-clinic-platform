import Link from "next/link";
import { getServerPatient, getServerPatientAnamnesisRecords } from "@/lib/server-api";
import { PatientPhotoUploadForm } from "@/components/media/patient-photo-upload-form";

type PatientPhotoUploadPageProps = {
  params: {
    id: string;
  };
};

export default async function PatientPhotoUploadPage({
  params,
}: PatientPhotoUploadPageProps) {
  try {
    const [patient, anamnesisRecords] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientAnamnesisRecords(params.id),
    ]);

    return (
      <section className="space-y-6">
        <Link
          href={`/patients/${patient.id}/photos`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para a galeria
        </Link>
        <PatientPhotoUploadForm
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          anamnesisRecords={anamnesisRecords}
        />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o envio de fotos.";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href={`/patients/${params.id}/photos`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para a galeria
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Envio de fotos indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
