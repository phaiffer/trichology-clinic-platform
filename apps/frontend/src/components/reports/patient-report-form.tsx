"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatientReport, getPatientPhotoFileUrl } from "@/lib/api";
import {
  PatientAnamnesisRecordListItem,
  PatientPhoto,
  PatientReportInput,
  ScoreResult,
} from "@/lib/types";

type PatientReportFormProps = {
  patientId: string;
  patientName: string;
  anamnesisRecords: PatientAnamnesisRecordListItem[];
  scoreResults: ScoreResult[];
  photos: PatientPhoto[];
};

const initialState: PatientReportInput = {
  anamnesisRecordId: null,
  scoreResultId: null,
  selectedPhotoIds: [],
  title: "",
  summary: null,
  reportType: "CLINICAL_EVALUATION",
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

export function PatientReportForm({
  patientId,
  patientName,
  anamnesisRecords,
  scoreResults,
  photos,
}: PatientReportFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PatientReportInput>({
    ...initialState,
    title: `${patientName} Clinical Evaluation`,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPhotosCount = useMemo(
    () => form.selectedPhotoIds.length,
    [form.selectedPhotoIds],
  );

  function updateField<K extends keyof PatientReportInput>(
    key: K,
    value: PatientReportInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function togglePhoto(photoId: string) {
    setForm((current) => {
      const selected = current.selectedPhotoIds.includes(photoId)
        ? current.selectedPhotoIds.filter((value) => value !== photoId)
        : [...current.selectedPhotoIds, photoId];

      return { ...current, selectedPhotoIds: selected };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const report = await createPatientReport(patientId, form);
      router.push(`/patients/${patientId}/reports/${report.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to generate report",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Clinical report
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-900">
              {patientName}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Assemble the first clinical PDF using the existing anamnesis, scoring,
              and photo records already stored for this patient.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
            {selectedPhotosCount} photo{selectedPhotosCount === 1 ? "" : "s"} selected
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Report title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Report type</span>
            <input
              type="text"
              value="Clinical evaluation"
              disabled
              className="w-full rounded-2xl border border-brand-100 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Clinical summary / observations
          </span>
          <textarea
            value={form.summary ?? ""}
            onChange={(event) => updateField("summary", event.target.value || null)}
            className="min-h-32 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="Optional clinician summary to include in the PDF."
          />
        </label>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Anamnesis record
            </span>
            <select
              value={form.anamnesisRecordId ?? ""}
              onChange={(event) =>
                updateField("anamnesisRecordId", event.target.value || null)
              }
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              <option value="">No specific anamnesis record</option>
              {anamnesisRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.templateName} • {formatDate(record.createdAt)}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Score result</span>
            <select
              value={form.scoreResultId ?? ""}
              onChange={(event) =>
                updateField("scoreResultId", event.target.value || null)
              }
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              <option value="">No score result selected</option>
              {scoreResults.map((score) => (
                <option key={score.id} value={score.id}>
                  {score.scoreType} • {score.scoreValue.toFixed(2)}
                  {score.classification ? ` • ${score.classification}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InfoBlock
            title="Available anamnesis records"
            value={String(anamnesisRecords.length)}
          />
          <InfoBlock title="Available score results" value={String(scoreResults.length)} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-900">Selected patient photos</h3>
            <p className="mt-2 text-sm text-slate-600">
              Pick the photos that should appear inside the generated PDF.
            </p>
          </div>
          <p className="text-sm text-slate-500">{photos.length} available</p>
        </div>

        {photos.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
            No patient photos are available yet. You can still generate a report without
            photos.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {photos.map((photo) => {
              const checked = form.selectedPhotoIds.includes(photo.id);

              return (
                <label
                  key={photo.id}
                  className={`block cursor-pointer rounded-3xl border p-4 transition ${
                    checked
                      ? "border-brand-500 bg-brand-50"
                      : "border-brand-100 hover:border-brand-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-brand-900">
                      {photo.category}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePhoto(photo.id)}
                      className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
                    />
                  </div>

                  <img
                    src={getPatientPhotoFileUrl(patientId, photo.id)}
                    alt={photo.originalFileName}
                    className="mt-3 h-44 w-full rounded-2xl object-cover"
                  />

                  <p className="mt-3 text-sm font-medium text-slate-800">
                    {photo.originalFileName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(photo.captureDate)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {photo.notes || "No notes registered."}
                  </p>
                </label>
              );
            })}
          </div>
        )}
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Generating PDF..." : "Generate report"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type InfoBlockProps = {
  title: string;
  value: string;
};

function InfoBlock({ title, value }: InfoBlockProps) {
  return (
    <div className="rounded-2xl bg-sand px-4 py-3">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-1 text-lg font-semibold text-brand-900">{value}</p>
    </div>
  );
}
