import Link from "next/link";
import { canAccessScoring, requireAuthenticatedUser } from "@/lib/auth";
import {
  getServerPatient,
  getServerPatientAnamnesisRecords,
  getServerPatientPhotos,
  getServerPatientScoreResults,
} from "@/lib/server-api";
import { PatientReportForm } from "@/components/reports/patient-report-form";

type NewPatientReportPageProps = {
  params: {
    id: string;
  };
};

export default async function NewPatientReportPage({
  params,
}: NewPatientReportPageProps) {
  try {
    const currentUser = await requireAuthenticatedUser();
    const canUseScoring = canAccessScoring(currentUser);
    const [patient, anamnesisRecords, photos] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientAnamnesisRecords(params.id),
      getServerPatientPhotos(params.id),
    ]);
    const scoreResults = canUseScoring
      ? await getServerPatientScoreResults(params.id)
      : [];

    const patientName = `${patient.firstName} ${patient.lastName}`;

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${patient.id}`} className="text-sm font-medium text-brand-700">
            Back to patient
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Generate report
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Create the first downloadable clinical evaluation PDF from the local
            patient record.
          </p>
        </div>

        <PatientReportForm
          patientId={patient.id}
          patientName={patientName}
          anamnesisRecords={anamnesisRecords}
          scoreResults={scoreResults}
          photos={photos}
          canUseScoring={canUseScoring}
        />
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load report generation flow";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
            Back to patient
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Report generation unavailable
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}
