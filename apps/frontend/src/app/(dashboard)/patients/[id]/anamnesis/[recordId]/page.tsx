import Link from "next/link";
import { CreateScoreButton } from "@/components/scoring/create-score-button";
import { canAccessScoring, requireAuthenticatedUser } from "@/lib/auth";
import {
  getServerPatientAnamnesisRecord,
  getServerPatientScoreResults,
} from "@/lib/server-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US").format(new Date(value));
}

function formatValue(value: string | number | boolean | string[] | null) {
  if (value === null) {
    return "No answer";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "No answer";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
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
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link
            href={`/patients/${params.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Back to patient
          </Link>
          <h1 className="mt-3 text-3xl font-semibold text-brand-900">
            {record.templateName}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Submitted for {record.patientName} on {formatDate(record.createdAt)}.
          </p>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {canViewScoring ? (
              <CreateScoreButton patientId={params.id} recordId={params.recordId} />
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Score calculation is available only for clinician and admin accounts.
              </div>
            )}

            {canViewScoring && scoreResults.length > 0 ? (
              <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
                {scoreResults.length} stored score{scoreResults.length === 1 ? "" : "s"} for
                this anamnesis record
              </div>
            ) : null}
          </div>
        </div>

        {canViewScoring ? (
          <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-brand-900">Score history</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Recalculating creates a new stored result so the clinician can keep
                  score history per anamnesis submission.
                </p>
              </div>
            </div>

            {scoreResults.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No scores have been calculated from this anamnesis record yet.
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
                        {score.totalScore.toFixed(2)} •{" "}
                        {score.classification || "UNCLASSIFIED"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Calculated {formatDate(score.calculatedAt)}
                      </p>
                    </div>

                    <Link
                      href={`/patients/${params.id}/scores/${score.id}`}
                      className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                    >
                      View score details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-900">Submitted answers</h2>

          <div className="mt-6 space-y-4">
            {record.answers.map((answer, index) => (
              <article
                key={answer.id}
                className="rounded-3xl border border-brand-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-900">
                      {index + 1}. {answer.questionLabel}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{answer.questionType}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-700">
                  {formatValue(answer.value)}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load anamnesis record";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
          Back to patient
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Anamnesis record not available
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}
