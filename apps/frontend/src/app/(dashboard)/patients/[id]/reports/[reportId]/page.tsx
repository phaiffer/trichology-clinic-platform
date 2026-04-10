/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getPatient,
  getPatientPhotoFileUrl,
  getPatientReport,
  getPatientReportFileUrl,
} from "@/lib/api";
import { DeleteReportButton } from "@/components/reports/delete-report-button";

type PatientReportDetailsPageProps = {
  params: {
    id: string;
    reportId: string;
  };
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: value.includes("T") ? "short" : undefined,
  }).format(new Date(normalizedValue));
}

export default async function PatientReportDetailsPage({
  params,
}: PatientReportDetailsPageProps) {
  try {
    const [patient, report] = await Promise.all([
      getPatient(params.id),
      getPatientReport(params.id, params.reportId),
    ]);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${patient.id}`} className="text-sm font-medium text-brand-700">
            Back to patient
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Report details
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-brand-900">
                {report.title}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Review the stored report metadata and open the generated PDF from local
                storage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getPatientReportFileUrl(patient.id, report.id)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Open PDF
              </a>
              <a
                href={getPatientReportFileUrl(patient.id, report.id)}
                download={report.fileName}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Download PDF
              </a>
              <DeleteReportButton
                patientId={patient.id}
                reportId={report.id}
                reportTitle={report.title}
                redirectTo={`/patients/${patient.id}`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Report metadata</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Patient" value={report.patientName} />
                <InfoItem label="Report type" value={report.reportType.replaceAll("_", " ")} />
                <InfoItem label="Generated at" value={formatDate(report.generatedAt)} />
                <InfoItem label="Created at" value={formatDate(report.createdAt)} />
                <InfoItem label="File name" value={report.fileName} />
                <InfoItem label="Selected photos" value={String(report.selectedPhotosCount)} />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Clinical summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {report.summary || "No clinician summary was stored for this report."}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Linked records</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Patient ID" value={report.patientId} />
                <InfoItem label="Anamnesis record" value={report.anamnesisRecordId || "-"} />
                <InfoItem
                  label="Anamnesis template"
                  value={report.anamnesisTemplateName || "-"}
                />
                <InfoItem label="Score result" value={report.scoreResultId || "-"} />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Score summary</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Score type" value={report.scoreType || "-"} />
                <InfoItem
                  label="Score value"
                  value={
                    typeof report.scoreValue === "number"
                      ? report.scoreValue.toFixed(2)
                      : "-"
                  }
                />
                <InfoItem
                  label="Classification"
                  value={report.scoreClassification || "-"}
                />
                <InfoItem
                  label="Interpretation"
                  value={report.scoreInterpretation || "-"}
                />
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Selected photos</h2>
              {report.selectedPhotos.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  This report was generated without patient photos.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {report.selectedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="rounded-3xl border border-brand-100 p-4"
                    >
                      <img
                        src={getPatientPhotoFileUrl(patient.id, photo.id)}
                        alt={photo.originalFileName}
                        className="h-48 w-full rounded-2xl object-cover"
                      />
                      <p className="mt-3 text-sm font-semibold text-brand-900">
                        {photo.originalFileName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {photo.category} • {formatDate(photo.captureDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {photo.notes || "No photo notes registered."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load report";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
            Back to patient
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            Report not available
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
      <dd className="mt-1 text-sm text-slate-800 break-all">{value}</dd>
    </div>
  );
}
