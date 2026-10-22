import Link from "next/link";
import { CreateScoreButton } from "@/components/scoring/create-score-button";
import { canAccessScoring, requireAuthenticatedUser } from "@/lib/auth";
import {
  formatBoolean,
  formatDate,
  formatDateTime,
  formatDecimal,
  formatFlexibleNumber,
  formatQuestionType,
  formatScoreClassification,
} from "@/lib/formatters";
import {
  getServerPatientAnamnesisRecord,
  getServerPatientScoreResults,
} from "@/lib/server-api";
import { QuestionType } from "@/lib/types";

function formatValue(
  value: string | number | boolean | string[] | null,
  questionType: QuestionType,
) {
  if (value === null) {
    return "Sem resposta";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Sem resposta";
  }

  if (typeof value === "boolean") {
    return formatBoolean(value);
  }

  if (typeof value === "number") {
    return formatFlexibleNumber(value);
  }

  if (questionType === "DATE" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatDate(value);
  }

  if (value === "true" || value === "false") {
    return formatBoolean(value);
  }

  return String(value);
}

export default async function PatientAnamnesisRecordPage({
  params,
}: {
  params: { id: string; recordId: string };
}) {
  try {
    const currentUser = await requireAuthenticatedUser();
    const canViewScoring = canAccessScoring(currentUser);
    const record = await getServerPatientAnamnesisRecord(params.id, params.recordId);
    const allScores = canViewScoring
      ? await getServerPatientScoreResults(params.id)
      : [];
    const scoreResults = allScores.filter(
      (score) => score.anamnesisRecordId === params.recordId,
    );

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
            Registro de anamnese
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
            {record.templateName}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Preenchido para {record.patientName} em{" "}
            {formatDateTime(record.createdAt)}.
          </p>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {canViewScoring ? (
              <CreateScoreButton patientId={params.id} recordId={params.recordId} />
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                O cálculo de pontuação está disponível apenas para tricologistas e
                administradores.
              </div>
            )}

            {canViewScoring && scoreResults.length > 0 ? (
              <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
                {scoreResults.length}{" "}
                {scoreResults.length === 1
                  ? "pontuação armazenada"
                  : "pontuações armazenadas"}{" "}
                para este registro de anamnese
              </div>
            ) : null}
          </div>
        </div>

        {canViewScoring ? (
          <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-brand-900">
                  Histórico de pontuações
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Cada cálculo gera um resultado armazenado, permitindo consultar o
                  histórico de pontuação vinculado a esta anamnese.
                </p>
              </div>
            </div>

            {scoreResults.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Nenhuma pontuação foi calculada a partir deste registro de anamnese
                ainda.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {scoreResults.map((score) => (
                  <div
                    key={score.id}
                    className="flex flex-col gap-3 rounded-3xl border border-brand-100 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-brand-900">
                        {formatDecimal(score.totalScore)} •{" "}
                        {formatScoreClassification(score.classification)}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Calculada em {formatDateTime(score.calculatedAt)}
                      </p>
                    </div>

                    <Link
                      href={`/patients/${params.id}/scores/${score.id}`}
                      className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                    >
                      Ver detalhes da pontuação
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-900">
            Respostas registradas
          </h2>

          <div className="mt-6 space-y-4">
            {record.answers.map((answer, index) => (
              <article
                key={answer.id}
                className="rounded-3xl border border-brand-100 p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {index + 1}. {answer.questionLabel}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatQuestionType(answer.questionType)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {formatValue(answer.value, answer.questionType)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar o registro de anamnese";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href={`/patients/${params.id}`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para o paciente
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Registro de anamnese indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
