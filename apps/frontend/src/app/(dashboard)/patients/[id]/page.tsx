/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getPatient,
  getPatientAnamnesisRecords,
  getPatientPhotoFileUrl,
  getPatientPhotos,
  getPatientReportFileUrl,
  getPatientReports,
  getPatientScoreResults,
} from "@/lib/api";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { DeleteReportButton } from "@/components/reports/delete-report-button";

type PatientDetailsPageProps = {
  params: {
    id: string;
  };
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;

  return new Intl.DateTimeFormat("en-US").format(new Date(normalizedValue));
}

export default async function PatientDetailsPage({
  params,
}: PatientDetailsPageProps) {
  try {
    const [patient, anamnesisRecords, reports, scoreResults] = await Promise.all([
      getPatient(params.id),
      getPatientAnamnesisRecords(params.id),
      getPatientReports(params.id),
      getPatientScoreResults(params.id),
    ]);
    const patientPhotos = await getPatientPhotos(params.id);

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const recentPhotos = patientPhotos.slice(0, 4);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href="/patients" className="text-sm font-medium text-brand-700">
            Back to patients
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Patient details
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-brand-900">
                {patientName}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Review the patient record, start a new anamnesis, and inspect existing
                intake history before later clinical modules build on top of it.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/patients/${patient.id}/photos`}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Open photos
              </Link>
              <Link
                href={`/patients/${patient.id}/anamnesis/new`}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Start anamnesis
              </Link>
              <Link
                href={`/patients/${patient.id}/edit`}
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Edit patient
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Profile</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Email" value={patient.email} />
                <InfoItem label="Phone" value={patient.phone || "-"} />
                <InfoItem label="Birth date" value={formatDate(patient.birthDate)} />
                <InfoItem label="Gender" value={patient.gender || "-"} />
                <InfoItem label="Status" value={patient.active ? "Active" : "Inactive"} />
                <InfoItem
                  label="Consent"
                  value={patient.consentAccepted ? "Collected" : "Not collected"}
                />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Clinical notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {patient.notes || "No clinical notes registered yet."}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-900">Patient photos</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Clinical image metadata and local file access for before, after,
                    and progress follow-up.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/patients/${patient.id}/photos/upload`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Upload photos
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/photos/compare`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Compare
                  </Link>
                </div>
              </div>

              {patientPhotos.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                  No patient photos uploaded yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {recentPhotos.map((photo) => (
                    <Link
                      key={photo.id}
                      href={`/patients/${patient.id}/photos/${photo.id}`}
                      className="rounded-3xl border border-brand-100 p-4 transition hover:border-brand-300"
                    >
                      <img
                        src={getPatientPhotoFileUrl(patient.id, photo.id)}
                        alt={photo.originalFileName}
                        className="h-52 w-full rounded-2xl object-cover"
                      />
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-brand-900">
                            {photo.originalFileName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(photo.captureDate)}
                          </p>
                        </div>
                        <PhotoCategoryBadge category={photo.category} />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                        {photo.notes || "No notes registered."}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {patientPhotos.length > 0 ? (
                <div className="mt-5">
                  <Link
                    href={`/patients/${patient.id}/photos`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    View full gallery
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-900">Anamnesis history</h2>
                <Link
                  href={`/patients/${patient.id}/anamnesis/new`}
                  className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                >
                  New record
                </Link>
              </div>

              {anamnesisRecords.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  No anamnesis records for this patient yet.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {anamnesisRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col gap-3 rounded-3xl border border-brand-100 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-brand-900">
                          {record.templateName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Submitted {formatDate(record.createdAt)}
                        </p>
                      </div>

                      <Link
                        href={`/patients/${patient.id}/anamnesis/${record.id}`}
                        className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                      >
                        View record
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-900">Score history</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Native score results calculated from stored anamnesis submissions.
                  </p>
                </div>
              </div>

              {scoreResults.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                  No score results generated for this patient yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {scoreResults.map((score) => (
                    <div
                      key={score.id}
                      className="flex flex-col gap-3 rounded-3xl border border-brand-100 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-brand-900">
                          {score.anamnesisTemplateName || "Legacy score"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {score.totalScore.toFixed(2)} •{" "}
                          {score.classification || "UNCLASSIFIED"} •{" "}
                          {formatDate(score.calculatedAt)}
                        </p>
                      </div>

                      <Link
                        href={`/patients/${patient.id}/scores/${score.id}`}
                        className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                      >
                        View score details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-900">Reports</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Generate clinical PDFs for follow-up, presentation, and structured
                    local export.
                  </p>
                </div>
                <Link
                  href={`/patients/${patient.id}/reports/new`}
                  className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  Generate report
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                  No reports generated for this patient yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-3xl border border-brand-100 p-4"
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-brand-900">
                            {report.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {report.reportType.replaceAll("_", " ")} • Generated{" "}
                            {formatDate(report.generatedAt)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {report.summary || "No clinician summary registered."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/patients/${patient.id}/reports/${report.id}`}
                            className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                          >
                            View metadata
                          </Link>
                          <a
                            href={getPatientReportFileUrl(patient.id, report.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                          >
                            Open PDF
                          </a>
                          <DeleteReportButton
                            patientId={patient.id}
                            reportId={report.id}
                            reportTitle={report.title}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Record metadata</h2>
              <dl className="mt-6 space-y-4">
                <InfoItem label="Created at" value={formatDate(patient.createdAt)} />
                <InfoItem label="Updated at" value={formatDate(patient.updatedAt)} />
                <InfoItem label="Patient ID" value={patient.id} />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-800">Danger zone</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Deleting a patient currently performs a hard delete. This is intentional
                for the early baseline until audit and restore flows exist.
              </p>
              <div className="mt-4">
                <DeletePatientButton patientId={patient.id} patientName={patientName} />
              </div>
            </div>
          </div>
        </div>
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

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
