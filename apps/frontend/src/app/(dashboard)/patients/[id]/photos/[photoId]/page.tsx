/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPatientPhotoFileUrl } from "@/lib/api";
import { DeletePhotoButton } from "@/components/media/delete-photo-button";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";
import { formatDate, formatDateTime, formatFlexibleNumber } from "@/lib/formatters";
import { getServerPatient, getServerPatientPhoto } from "@/lib/server-api";

type PatientPhotoDetailsPageProps = {
  params: {
    id: string;
    photoId: string;
  };
};

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
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${patient.id}/photos`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para a galeria
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Detalhes da foto clínica
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Consulte os metadados registrados, visualize a imagem e remova o
                arquivo caso não deva mais compor o histórico clínico.
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
              className="h-[26rem] w-full rounded-3xl bg-sand object-contain sm:h-[42rem]"
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Metadados</h2>
              <dl className="mt-6 space-y-4">
                <InfoItem label="Arquivo original" value={photo.originalFileName} />
                <InfoItem label="Nome interno" value={photo.fileName} />
                <InfoItem label="Tipo de conteúdo" value={photo.contentType} />
                <InfoItem
                  label="Tamanho do arquivo"
                  value={`${formatFlexibleNumber(photo.fileSize)} bytes`}
                />
                <InfoItem
                  label="Data da captura"
                  value={formatDate(photo.captureDate)}
                />
                <InfoItem
                  label="Enviada em"
                  value={formatDateTime(photo.createdAt)}
                />
                <InfoItem
                  label="Anamnese vinculada"
                  value={photo.anamnesisTemplateName || "Não vinculada"}
                />
              </dl>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-brand-900">Observações</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {photo.notes || "Nenhuma observação registrada."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-800">Excluir foto</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                A exclusão de uma foto clínica remove tanto os metadados quanto o
                arquivo físico armazenado.
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
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a foto do paciente.";

    return (
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href={`/patients/${params.id}/photos`}
          className="text-sm font-medium text-brand-700"
        >
          Voltar para a galeria
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
          Foto indisponível
        </h1>
        <p className="mt-3 text-sm text-red-700">{message}</p>
      </section>
    );
  }
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-sm text-slate-800">{value}</dd>
    </div>
  );
}
