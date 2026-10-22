"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPatientPhotos } from "@/lib/api";
import { formatPhotoCategory } from "@/lib/formatters";
import {
  PatientAnamnesisRecordListItem,
  PatientPhotoUploadInput,
  PhotoCategory,
} from "@/lib/types";

const categories: PhotoCategory[] = ["BEFORE", "AFTER", "PROGRESS"];

type PatientPhotoUploadFormProps = {
  patientId: string;
  patientName: string;
  anamnesisRecords: PatientAnamnesisRecordListItem[];
};

export function PatientPhotoUploadForm({
  patientId,
  patientName,
  anamnesisRecords,
}: PatientPhotoUploadFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<PhotoCategory>("PROGRESS");
  const [captureDate, setCaptureDate] = useState("");
  const [notes, setNotes] = useState("");
  const [anamnesisRecordId, setAnamnesisRecordId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (files.length === 0) {
      setError("Selecione pelo menos um arquivo de imagem.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: PatientPhotoUploadInput = {
      files,
      category,
      captureDate: captureDate || null,
      notes: notes || null,
      anamnesisRecordId: anamnesisRecordId || null,
    };

    try {
      await uploadPatientPhotos(patientId, payload);
      router.push(`/patients/${patientId}/photos`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Não foi possível enviar as fotos do paciente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Envio de fotos do paciente
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
          {patientName}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Envie uma ou mais imagens clínicas com metadados compartilhados para compor a
          galeria de evolução capilar.
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Arquivos de imagem
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="block w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-700"
          />
          <p className="text-xs text-slate-500">
            Formatos suportados: JPEG, PNG e WebP. Todos os arquivos selecionados
            recebem a mesma categoria, data de captura, observações e vínculo com
            anamnese.
          </p>
        </label>

        <div className="rounded-3xl bg-sand px-5 py-4">
          <p className="text-sm font-semibold text-brand-900">
            Arquivos selecionados
          </p>
          {files.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Nenhum arquivo selecionado ainda.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="rounded-2xl bg-white px-3 py-2"
                >
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Categoria</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as PhotoCategory)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {formatPhotoCategory(option)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Data da captura</span>
          <input
            type="date"
            value={captureDate}
            onChange={(event) => setCaptureDate(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Registro de anamnese vinculado
          </span>
          <select
            value={anamnesisRecordId}
            onChange={(event) => setAnamnesisRecordId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            <option value="">Sem vínculo com anamnese</option>
            {anamnesisRecords.map((record) => (
              <option key={record.id} value={record.id}>
                {record.templateName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Observações</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="Posicionamento clínico, ângulo, contexto do tratamento ou observações relevantes."
          />
        </label>
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
          {isSubmitting ? "Enviando..." : "Enviar fotos"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/patients/${patientId}/photos`)}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
