import Link from "next/link";
import { getPatientAnamnesisRecord } from "@/lib/api";

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
    const record = await getPatientAnamnesisRecord(params.id, params.recordId);

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
        </div>

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
