import Link from "next/link";
import { getPatientScoreResult } from "@/lib/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function PatientScoreDetailsPage({
  params,
}: {
  params: { id: string; scoreId: string };
}) {
  try {
    const score = await getPatientScoreResult(params.id, params.scoreId);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
            Back to patient
          </Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
            Score result
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-900">
            {score.anamnesisTemplateName || "Legacy score"}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Stored scoring result for {score.patientName}
            {score.anamnesisRecordId
              ? `, calculated from anamnesis record ${score.anamnesisRecordId}.`
              : "."}
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Overview</h2>
              <dl className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoItem label="Patient" value={score.patientName} />
                <InfoItem
                  label="Classification"
                  value={score.classification || "UNCLASSIFIED"}
                />
                <InfoItem label="Total score" value={score.totalScore.toFixed(2)} />
                <InfoItem label="Calculated at" value={formatDate(score.calculatedAt)} />
              </dl>

              <div className="mt-6 rounded-2xl bg-sand px-4 py-4">
                <p className="text-sm font-medium text-slate-700">Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {score.summary || "No summary stored for this score result."}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Links</h2>
              <div className="mt-4 flex flex-col gap-3">
                {score.anamnesisRecordId ? (
                  <Link
                    href={`/patients/${params.id}/anamnesis/${score.anamnesisRecordId}`}
                    className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Open source anamnesis record
                  </Link>
                ) : null}
                <Link
                  href={`/patients/${params.id}/reports/new`}
                  className="text-sm font-medium text-brand-700 transition hover:text-brand-900"
                >
                  Use this score in a report
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-900">Itemized contributions</h2>

            {score.items.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No itemized contributions were stored for this score result.
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
                        <p className="mt-1 text-sm text-slate-500">{item.questionType}</p>
                      </div>
                      <div className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                        +{item.contribution.toFixed(2)}
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-700">
                      Answer: {item.answerValue || "-"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.ruleApplied}
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
      error instanceof Error ? error.message : "Unable to load score result";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}`} className="text-sm font-medium text-brand-700">
          Back to patient
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">
          Score result not available
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
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
