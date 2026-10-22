/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  getPatientPhotoFileUrl,
  getPatientReportFileUrl,
} from "@/lib/api";
import { canAccessScoring, requireAuthenticatedUser } from "@/lib/auth";
import {
  formatDate,
  formatDateTime,
  formatDecimal,
  formatGender,
  formatReportType,
  formatScoreClassification,
} from "@/lib/formatters";
import {
  getServerPatient,
  getServerPatientAnamnesisRecords,
  getServerPatientPhotos,
  getServerPatientReports,
  getServerPatientScoreResults,
} from "@/lib/server-api";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";
import { DeletePatientButton } from "@/components/patients/delete-patient-button";
import { DeleteReportButton } from "@/components/reports/delete-report-button";

type PatientDetailsPageProps = {
  params: {
    id: string;
  };
};

export default async function PatientDetailsPage({
  params,
}: PatientDetailsPageProps) {
  try {
    const currentUser = await requireAuthenticatedUser();
    const canViewScoring = canAccessScoring(currentUser);
    const [patient, anamnesisRecords, reports, patientPhotos] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientAnamnesisRecords(params.id),
      getServerPatientReports(params.id),
      getServerPatientPhotos(params.id),
    ]);
    const scoreResults = canViewScoring
      ? await getServerPatientScoreResults(params.id)
      : [];

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const recentPhotos = patientPhotos.slice(0, 4);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link href="/patients" className="text-sm font-medium text-brand-700">
            Voltar para pacientes
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Prontuário do paciente
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
                {patientName}
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Consulte os dados cadastrais, inicie uma nova anamnese e acompanhe o
                histórico de avaliações, fotos clínicas, pontuações e relatórios.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/patients/${patient.id}/photos`}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Abrir fotos
              </Link>
              <Link
                href={`/patients/${patient.id}/anamnesis/new`}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Iniciar anamnese
              </Link>
              <Link
                href={`/patients/${patient.id}/edit`}
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Editar paciente
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Perfil clínico</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="E-mail" value={patient.email} />
                <InfoItem label="Telefone" value={patient.phone || "-"} />
                <InfoItem
                  label="Data de nascimento"
                  value={formatDate(patient.birthDate)}
                />
                <InfoItem label="Gênero" value={formatGender(patient.gender)} />
                <InfoItem
                  label="Status"
                  value={patient.active ? "Ativo" : "Inativo"}
                />
                <InfoItem
                  label="Consentimento LGPD"
                  value={patient.consentAccepted ? "Coletado" : "Pendente"}
                />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">
                  Observações clínicas
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {patient.notes || "Nenhuma observação clínica cadastrada."}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-brand-900">
                    Fotos do paciente
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Registro fotográfico clínico para acompanhamento de antes, depois e
                    evolução do tratamento.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/patients/${patient.id}/photos/upload`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Enviar fotos
                  </Link>
                  <Link
                    href={`/patients/${patient.id}/photos/compare`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Comparar
                  </Link>
                </div>
              </div>

              {patientPhotos.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                  Nenhuma foto clínica enviada para este paciente ainda.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {recentPhotos.map((photo) => (
                    <Link
                      key={photo.id}
                      href={`/patients/${patient.id}/photos/${photo.id}`}
                      className="min-w-0 rounded-3xl border border-brand-100 p-4 transition hover:border-brand-300"
                    >
                      <img
                        src={getPatientPhotoFileUrl(patient.id, photo.id)}
                        alt={photo.originalFileName}
                        className="h-52 w-full rounded-2xl object-cover"
                      />
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brand-900">
                            {photo.originalFileName}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(photo.captureDate)}
                          </p>
                        </div>
                        <PhotoCategoryBadge category={photo.category} />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                        {photo.notes || "Nenhuma observação registrada."}
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
                    Ver galeria completa
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-brand-900">
                  Histórico de anamnese
                </h2>
                <Link
                  href={`/patients/${patient.id}/anamnesis/new`}
                  className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                >
                  Novo registro
                </Link>
              </div>

              {anamnesisRecords.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">
                  Nenhum registro de anamnese para este paciente ainda.
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
                          Registrada em {formatDate(record.createdAt)}
                        </p>
                      </div>

                      <Link
                        href={`/patients/${patient.id}/anamnesis/${record.id}`}
                        className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                      >
                        Ver registro
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canViewScoring ? (
              <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-900">
                      Histórico de pontuações
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Resultados de pontuação calculados a partir dos registros de
                      anamnese armazenados.
                    </p>
                  </div>
                </div>

                {scoreResults.length === 0 ? (
                  <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                    Nenhum resultado de pontuação gerado para este paciente ainda.
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
                            {score.anamnesisTemplateName || "Pontuação clínica"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDecimal(score.totalScore)} •{" "}
                            {formatScoreClassification(score.classification)} •{" "}
                            {formatDate(score.calculatedAt)}
                          </p>
                        </div>

                        <Link
                          href={`/patients/${patient.id}/scores/${score.id}`}
                          className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                        >
                          Ver detalhes da pontuação
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-brand-900">Relatórios</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Gere laudos clínicos em PDF para acompanhamento, apresentação ao
                    paciente e exportação estruturada.
                  </p>
                </div>
                <Link
                  href={`/patients/${patient.id}/reports/new`}
                  className="inline-flex self-start rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 sm:self-auto"
                >
                  Gerar relatório
                </Link>
              </div>

              {reports.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
                  Nenhum relatório gerado para este paciente ainda.
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
                            {formatReportType(report.reportType)} • Gerado em{" "}
                            {formatDate(report.generatedAt)}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {report.summary || "Nenhum resumo clínico registrado."}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/patients/${patient.id}/reports/${report.id}`}
                            className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                          >
                            Ver detalhes
                          </Link>
                          <a
                            href={getPatientReportFileUrl(patient.id, report.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                          >
                            Abrir PDF
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

          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">
                Metadados do cadastro
              </h2>
              <dl className="mt-6 space-y-4">
                <InfoItem
                  label="Criado em"
                  value={formatDateTime(patient.createdAt)}
                />
                <InfoItem
                  label="Atualizado em"
                  value={formatDateTime(patient.updatedAt)}
                />
              <div className="mt-4">
                <InfoItem
                  label="ID do paciente"
                  value={patient.id}
                  breakAll
                />
              </div>
              </dl>
            </div>

            <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-800">Zona de exclusão</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A exclusão de um paciente remove permanentemente o cadastro do banco de
                dados. Confirme apenas quando o registro não for mais necessário.
              </p>
              <div className="mt-4">
                <DeletePatientButton
                  patientId={patient.id}
                  patientName={patientName}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar o paciente";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link href="/patients" className="text-sm font-medium text-brand-700">
            Voltar para pacientes
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Paciente indisponível
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
