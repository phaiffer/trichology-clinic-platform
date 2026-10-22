/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getPatientPhotoFileUrl,
  getPatientReportFileUrl,
} from "@/lib/api";
import { DeleteReportButton } from "@/components/reports/delete-report-button";
import {
  formatDate,
  formatDateTime,
  formatDecimal,
  formatPhotoCategory,
  formatReportType,
  formatScoreClassification,
  formatScoreSummary,
  formatScoreType,
} from "@/lib/formatters";
import { getServerPatient, getServerPatientReport } from "@/lib/server-api";

type PatientReportDetailsPageProps = {
  params: {
    id: string;
    reportId: string;
  };
};

export default async function PatientReportDetailsPage({
  params,
}: PatientReportDetailsPageProps) {
  try {
    const [patient, report] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientReport(params.id, params.reportId),
    ]);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Detalhes do relatório
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
                {report.title}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Consulte os metadados do laudo clínico e abra ou baixe o PDF gerado.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getPatientReportFileUrl(patient.id, report.id)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Abrir PDF
              </a>
              <a
                href={getPatientReportFileUrl(patient.id, report.id)}
                download={report.fileName}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Baixar PDF
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">
                Metadados do relatório
              </h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Paciente" value={report.patientName} />
                <InfoItem
                  label="Tipo de relatório"
                  value={formatReportType(report.reportType)}
                />
                <InfoItem
                  label="Gerado em"
                  value={formatDateTime(report.generatedAt)}
                />
                <InfoItem
                  label="Criado em"
                  value={formatDateTime(report.createdAt)}
                />
                <InfoItem
                  label="Nome do arquivo"
                  value={report.fileName}
                  breakAll
                />
                <InfoItem
                  label="Fotos selecionadas"
                  value={String(report.selectedPhotosCount)}
                />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Resumo clínico</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {report.summary ||
                    "Nenhum resumo clínico foi registrado para este relatório."}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">
                Registros vinculados
              </h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="ID do paciente" value={report.patientId} />
                <InfoItem
                  label="Registro de anamnese"
                  value={report.anamnesisRecordId || "-"}
                />
                <InfoItem
                  label="Modelo de anamnese"
                  value={report.anamnesisTemplateName || "-"}
                />
                <InfoItem
                  label="Resultado da pontuação"
                  value={report.scoreResultId || "-"}
                />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">
                Resumo da pontuação
              </h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem
                  label="Tipo de pontuação"
                  value={formatScoreType(report.scoreType)}
                />
                <InfoItem
                  label="Valor da pontuação"
                  value={
                    typeof report.scoreValue === "number"
                      ? formatDecimal(report.scoreValue)
                      : "-"
                  }
                />
                <InfoItem
                  label="Classificação"
                  value={
                    report.scoreClassification
                      ? formatScoreClassification(report.scoreClassification)
                      : "-"
                  }
                />
                <InfoItem
                  label="Interpretação"
                  value={
                    report.scoreInterpretation
                      ? formatScoreSummary(report.scoreInterpretation)
                      : "-"
                  }
                />
              </dl>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">
                Fotos selecionadas
              </h2>
              {report.selectedPhotos.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Este relatório foi gerado sem fotos do paciente.
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
                        {formatPhotoCategory(photo.category)} •{" "}
                        {formatDate(photo.captureDate)}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {photo.notes || "Nenhuma observação registrada para a foto."}
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
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o relatório";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${params.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Relatório indisponível
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
  breakAll?: boolean;
};

function InfoItem({ label, value, breakAll = false }: InfoItemProps) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd
        className={`mt-1 text-sm text-slate-800 ${
          breakAll ? "break-all" : "break-words"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
