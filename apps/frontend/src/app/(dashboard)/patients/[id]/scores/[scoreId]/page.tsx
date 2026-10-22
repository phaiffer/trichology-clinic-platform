import Link from "next/link";
import { requireAnyRole } from "@/lib/auth";
import {
  formatDateTime,
  formatDecimal,
  formatQuestionType,
  formatScoreAnswerValue,
  formatScoreClassification,
  formatScoreRuleApplied,
  formatScoreSummary,
} from "@/lib/formatters";
import { getServerPatientScoreResult } from "@/lib/server-api";

export default async function PatientScoreDetailsPage({
  params,
}: {
  params: { id: string; scoreId: string };
}) {
  await requireAnyRole(["ADMIN", "CLINICIAN"]);

  try {
    const score = await getServerPatientScoreResult(params.id, params.scoreId);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${params.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
            Resultado da pontuação
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
            {score.anamnesisTemplateName || "Pontuação clínica"}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Resultado de pontuação armazenado para {score.patientName}
            {score.anamnesisRecordId
              ? ", calculado a partir do registro de anamnese vinculado."
              : "."}
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Visão geral</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Paciente" value={score.patientName} />
                <InfoItem
                  label="Classificação"
                  value={formatScoreClassification(score.classification)}
                />
                <InfoItem
                  label="Pontuação total"
                  value={formatDecimal(score.totalScore)}
                />
                <InfoItem
                  label="Calculada em"
                  value={formatDateTime(score.calculatedAt)}
                />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Resumo</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {formatScoreSummary(score.summary)}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Ações rápidas</h2>
              <div className="mt-4 flex flex-col gap-3">
                {score.anamnesisRecordId ? (
                  <Link
                    href={`/patients/${params.id}/anamnesis/${score.anamnesisRecordId}`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Abrir registro de anamnese de origem
                  </Link>
                ) : null}
                <Link
                  href={`/patients/${params.id}/reports/new`}
                  className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                >
                  Utilizar esta pontuação em um relatório
                </Link>
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-900">
              Contribuição por resposta
            </h2>

            {score.items.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Nenhuma contribuição detalhada foi armazenada para este resultado.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {score.items.map((item, index) => (
                  <article
                    key={`${item.questionId}-${index}`}
                    className="rounded-3xl border border-brand-100 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-brand-900">
                          {item.questionLabel}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatQuestionType(item.questionType)}
                        </p>
                      </div>
                      <div className="self-start rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                        +{formatDecimal(item.contribution)}
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-700">
                      Resposta:{" "}
                      <span className="font-medium text-brand-900">
                        {formatScoreAnswerValue(item.answerValue, item.questionType)}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {formatScoreRuleApplied(item.ruleApplied)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o resultado da pontuação";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href={`/patients/${params.id}`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para o paciente
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Resultado de pontuação indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
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
    <div className="min-w-0">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  );
}
