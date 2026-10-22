"use client";

/* eslint-disable @next/next/no-img-element */
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatientReport, getPatientPhotoFileUrl } from "@/lib/api";
import {
  formatDate,
  formatDecimal,
  formatPhotoCategory,
  formatScoreClassification,
} from "@/lib/formatters";
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
  canUseScoring: boolean;
};

const initialState: PatientReportInput = {
  anamnesisRecordId: null,
  scoreResultId: null,
  selectedPhotoIds: [],
  title: "",
  summary: null,
  reportType: "CLINICAL_EVALUATION",
};

export function PatientReportForm({
  patientId,
  patientName,
  anamnesisRecords,
  scoreResults,
  photos,
  canUseScoring,
}: PatientReportFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PatientReportInput>({
    ...initialState,
    title: `Avaliação Clínica Capilar — ${patientName}`,
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
          : "Não foi possível gerar o relatório",
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
              Relatório clínico
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-900">
              {patientName}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Consolide o laudo clínico em PDF utilizando os registros de anamnese,
              pontuação e fotos já armazenados para este paciente.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
            {selectedPhotosCount}{" "}
            {selectedPhotosCount === 1
              ? "foto selecionada"
              : "fotos selecionadas"}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Título do relatório
            </span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Tipo de relatório
            </span>
            <input
              type="text"
              value="Avaliação clínica"
              disabled
              className="w-full rounded-2xl border border-brand-100 bg-slate-50 px-4 py-3 text-slate-500"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Resumo clínico / observações
          </span>
          <textarea
            value={form.summary ?? ""}
            onChange={(event) =>
              updateField("summary", event.target.value || null)
            }
            className="min-h-32 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="Resumo clínico opcional para incluir no PDF."
          />
        </label>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Registro de anamnese
            </span>
            <select
              value={form.anamnesisRecordId ?? ""}
              onChange={(event) =>
                updateField("anamnesisRecordId", event.target.value || null)
              }
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              <option value="">Sem registro de anamnese específico</option>
              {anamnesisRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.templateName} • {formatDate(record.createdAt)}
                </option>
              ))}
            </select>
          </label>

          {canUseScoring ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Resultado da pontuação
              </span>
              <select
                value={form.scoreResultId ?? ""}
                onChange={(event) =>
                  updateField("scoreResultId", event.target.value || null)
                }
                className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
              >
                <option value="">Nenhum resultado de pontuação selecionado</option>
                {scoreResults.map((score) => (
                  <option key={score.id} value={score.id}>
                    {score.anamnesisTemplateName || "Pontuação clínica"} •{" "}
                    {formatDecimal(score.totalScore)}
                    {score.classification
                      ? ` • ${formatScoreClassification(score.classification)}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="rounded-2xl border border-brand-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              A seleção de pontuação está disponível apenas para tricologistas e
              administradores.
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <InfoBlock
            title="Registros de anamnese disponíveis"
            value={String(anamnesisRecords.length)}
          />
          <InfoBlock
            title="Resultados de pontuação disponíveis"
            value={String(scoreResults.length)}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-brand-900">
              Fotos do paciente selecionadas
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Escolha as imagens que devem aparecer no relatório em PDF.
            </p>
          </div>
          <p className="text-sm text-slate-500">
            {photos.length}{" "}
            {photos.length === 1 ? "disponível" : "disponíveis"}
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-brand-100 px-4 py-6 text-sm text-slate-500">
            Nenhuma foto do paciente disponível ainda. Você ainda pode gerar o
            relatório sem fotos.
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
                      {formatPhotoCategory(photo.category)}
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
                    {photo.notes || "Nenhuma observação registrada."}
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Gerando PDF..." : "Gerar relatório"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancelar
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
