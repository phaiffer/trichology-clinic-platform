/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { getPatientPhotoFileUrl } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
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

  const beforePhoto =
    beforePhotos.find((photo) => photo.id === beforePhotoId) ?? null;
  const afterPhoto =
    afterPhotos.find((photo) => photo.id === afterPhotoId) ?? null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
          Comparação antes e depois
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
          {patientName}
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Selecione uma imagem de Antes e uma de Depois para analisar a evolução do
          tratamento lado a lado.
        </p>
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Foto — Antes</span>
          <select
            value={beforePhotoId}
            onChange={(event) => setBeforePhotoId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {beforePhotos.length === 0 ? (
              <option value="">Nenhuma foto Antes disponível</option>
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
          <span className="text-sm font-medium text-slate-700">Foto — Depois</span>
          <select
            value={afterPhotoId}
            onChange={(event) => setAfterPhotoId(event.target.value)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
          >
            {afterPhotos.length === 0 ? (
              <option value="">Nenhuma foto Depois disponível</option>
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
            title="Antes"
            photo={beforePhoto}
          />
          <ComparisonCard
            patientId={patientId}
            title="Depois"
            photo={afterPhoto}
          />
        </section>
      ) : (
        <section className="rounded-[2rem] border border-brand-100 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Adicione pelo menos uma foto Antes e uma foto Depois para utilizar a
          comparação lado a lado.
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
        alt={`Foto clínica (${title})`}
        className="mt-5 h-[22rem] w-full rounded-3xl object-cover sm:h-[28rem]"
      />
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>{photo.originalFileName}</p>
        <p>
          {photo.captureDate
            ? `Capturada em ${formatDate(photo.captureDate)}`
            : "Sem data de captura informada"}
        </p>
        <p>{photo.notes ?? "Nenhuma observação registrada."}</p>
      </div>
    </article>
  );
}
