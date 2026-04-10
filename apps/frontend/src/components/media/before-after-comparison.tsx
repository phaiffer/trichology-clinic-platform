/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { getPatientPhotoFileUrl } from "@/lib/api";
import { PatientPhoto } from "@/lib/types";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";

type BeforeAfterComparisonProps = {
  patientId: string;
  patientName: string;
  photos: PatientPhoto[];
};

export function BeforeAfterComparison({
  patientId,
  patientName,
  photos,
}: BeforeAfterComparisonProps) {
  const beforePhotos = useMemo(
    () => photos.filter((photo) => photo.category === "BEFORE"),
    [photos],
  );
  const afterPhotos = useMemo(
    () => photos.filter((photo) => photo.category === "AFTER"),
    [photos],
  );

  const [beforePhotoId, setBeforePhotoId] = useState(beforePhotos[0]?.id ?? "");
  const [afterPhotoId, setAfterPhotoId] = useState(afterPhotos[0]?.id ?? "");

  const beforePhoto = beforePhotos.find((photo) => photo.id === beforePhotoId) ?? null;
  const afterPhoto = afterPhotos.find((photo) => photo.id === afterPhotoId) ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Before / after comparison
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-900">{patientName}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Select one BEFORE image and one AFTER image to review treatment evolution
          side by side.
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Before photo</span>
          <select
            value={beforePhotoId}
            onChange={(event) => setBeforePhotoId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {beforePhotos.length === 0 ? (
              <option value="">No BEFORE photos available</option>
            ) : (
              beforePhotos.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.originalFileName}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">After photo</span>
          <select
            value={afterPhotoId}
            onChange={(event) => setAfterPhotoId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {afterPhotos.length === 0 ? (
              <option value="">No AFTER photos available</option>
            ) : (
              afterPhotos.map((photo) => (
                <option key={photo.id} value={photo.id}>
                  {photo.originalFileName}
                </option>
              ))
            )}
          </select>
        </label>
      </section>

      {beforePhoto && afterPhoto ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <ComparisonCard
            patientId={patientId}
            title="Before"
            photo={beforePhoto}
          />
          <ComparisonCard patientId={patientId} title="After" photo={afterPhoto} />
        </section>
      ) : (
        <section className="rounded-[2rem] border border-brand-100 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Add at least one BEFORE photo and one AFTER photo to use the comparison view.
        </section>
      )}
    </div>
  );
}

function ComparisonCard({
  patientId,
  title,
  photo,
}: {
  patientId: string;
  title: string;
  photo: PatientPhoto;
}) {
  return (
    <article className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-brand-900">{title}</h2>
        <PhotoCategoryBadge category={photo.category} />
      </div>
      <img
        src={getPatientPhotoFileUrl(patientId, photo.id)}
        alt={`${title} clinical photo`}
        className="mt-5 h-[28rem] w-full rounded-3xl object-cover"
      />
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>{photo.originalFileName}</p>
        <p>{photo.captureDate ?? "No capture date provided"}</p>
        <p>{photo.notes ?? "No notes registered."}</p>
      </div>
    </article>
  );
}
