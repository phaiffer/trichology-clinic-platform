import Link from "next/link";
import { getPatient, getPatientPhotos } from "@/lib/api";
import { BeforeAfterComparison } from "@/components/media/before-after-comparison";

type PatientPhotoComparePageProps = {
  params: {
    id: string;
  };
};

export default async function PatientPhotoComparePage({
  params,
}: PatientPhotoComparePageProps) {
  try {
    const [patient, photos] = await Promise.all([
      getPatient(params.id),
      getPatientPhotos(params.id),
    ]);

    return (
      <section className="space-y-6">
        <Link href={`/patients/${patient.id}/photos`} className="text-sm font-medium text-brand-700">
          Back to gallery
        </Link>
        <BeforeAfterComparison
          patientId={patient.id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          photos={photos}
        />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load comparison view.";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}/photos`} className="text-sm font-medium text-brand-700">
          Back to gallery
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Comparison unavailable
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
