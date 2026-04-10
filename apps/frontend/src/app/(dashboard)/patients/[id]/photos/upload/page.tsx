import Link from "next/link";
import { getPatient, getPatientAnamnesisRecords } from "@/lib/api";
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
      getPatient(params.id),
      getPatientAnamnesisRecords(params.id),
    ]);

    return (
      <section className="space-y-6">
        <Link href={`/patients/${patient.id}/photos`} className="text-sm font-medium text-brand-700">
          Back to gallery
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
      error instanceof Error ? error.message : "Unable to load patient photo upload form.";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}/photos`} className="text-sm font-medium text-brand-700">
          Back to gallery
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Photo upload unavailable
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
