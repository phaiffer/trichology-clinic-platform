/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPatientPhotoFileUrl } from "@/lib/api";
import { DeletePhotoButton } from "@/components/media/delete-photo-button";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";
import { getServerPatient, getServerPatientPhoto } from "@/lib/server-api";

type PatientPhotoDetailsPageProps = {
  params: {
    id: string;
    photoId: string;
  };
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

export default async function PatientPhotoDetailsPage({
  params,
}: PatientPhotoDetailsPageProps) {
  try {
    const [patient, photo] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientPhoto(params.id, params.photoId),
    ]);

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <Link href={`/patients/${patient.id}/photos`} className="text-sm font-medium text-brand-700">
            Back to gallery
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Patient photo details
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-brand-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Review the stored metadata, open the image locally, and remove the photo
                if it should no longer be part of the patient history.
              </p>
            </div>
            <PhotoCategoryBadge category={photo.category} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
            <img
              src={getPatientPhotoFileUrl(patient.id, photo.id)}
              alt={photo.originalFileName}
              className="h-[42rem] w-full rounded-3xl object-contain bg-sand"
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Metadata</h2>
              <dl className="mt-6 space-y-4">
                <InfoItem label="Original file" value={photo.originalFileName} />
                <InfoItem label="Stored file name" value={photo.fileName} />
                <InfoItem label="Content type" value={photo.contentType} />
                <InfoItem label="File size" value={`${photo.fileSize} bytes`} />
                <InfoItem label="Capture date" value={formatDate(photo.captureDate)} />
                <InfoItem label="Created at" value={formatDate(photo.createdAt)} />
                <InfoItem
                  label="Related anamnesis"
                  value={photo.anamnesisTemplateName || "Not linked"}
                />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Notes</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {photo.notes || "No notes registered."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-800">Delete photo</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Deleting a patient photo removes both metadata and the physical file from
                local storage.
              </p>
              <div className="mt-4">
                <DeletePhotoButton
                  patientId={patient.id}
                  photoId={photo.id}
                  originalFileName={photo.originalFileName}
                  redirectTo={`/patients/${patient.id}/photos`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load patient photo.";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
        <Link href={`/patients/${params.id}/photos`} className="text-sm font-medium text-brand-700">
          Back to gallery
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-brand-900">Photo unavailable</h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}
