"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadPatientPhotos } from "@/lib/api";
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
      setError("Select at least one image file.");
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
          : "Unable to upload patient photos.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Patient photo upload
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">{patientName}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Upload one or more clinical images with shared metadata. Files stay on local
          disk and only metadata is persisted in the database.
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Image files</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            className="block w-full rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-700"
          />
          <p className="text-xs text-slate-500">
            Supported formats: JPEG, PNG, WebP. All selected files receive the same
            category, capture date, notes, and anamnesis link.
          </p>
        </label>

        <div className="rounded-3xl bg-sand px-5 py-4">
          <p className="text-sm font-semibold text-brand-900">Selected files</p>
          {files.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No files selected yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {files.map((file) => (
                <li key={`${file.name}-${file.lastModified}`} className="rounded-2xl bg-white px-3 py-2">
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as PhotoCategory)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Capture date</span>
          <input
            type="date"
            value={captureDate}
            onChange={(event) => setCaptureDate(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Related anamnesis record
          </span>
          <select
            value={anamnesisRecordId}
            onChange={(event) => setAnamnesisRecordId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            <option value="">No linked anamnesis record</option>
            {anamnesisRecords.map((record) => (
              <option key={record.id} value={record.id}>
                {record.templateName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-32 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="Clinical positioning, angle, treatment context, or other relevant notes."
          />
        </label>
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
          {isSubmitting ? "Uploading..." : "Upload photos"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/patients/${patientId}/photos`)}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
