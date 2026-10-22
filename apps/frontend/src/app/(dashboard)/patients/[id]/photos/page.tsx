/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getPatientPhotoFileUrl } from "@/lib/api";
import { PhotoCategoryBadge } from "@/components/media/photo-category-badge";
import { formatDate } from "@/lib/formatters";
import { PhotoCategory } from "@/lib/types";
import { getServerPatient, getServerPatientPhotos } from "@/lib/server-api";

type PatientPhotosPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    category?: string;
  };
};

const filterOptions: Array<{ label: string; value?: PhotoCategory }> = [
  { label: "Todas as fotos" },
  { label: "Antes", value: "BEFORE" },
  { label: "Depois", value: "AFTER" },
  { label: "Evolução", value: "PROGRESS" },
];

export default async function PatientPhotosPage({
  params,
  searchParams,
}: PatientPhotosPageProps) {
  const selectedCategory =
    searchParams?.category === "BEFORE" ||
    searchParams?.category === "AFTER" ||
    searchParams?.category === "PROGRESS"
      ? searchParams.category
      : undefined;

  try {
    const [patient, photos] = await Promise.all([
      getServerPatient(params.id),
      getServerPatientPhotos(params.id, selectedCategory),
    ]);
    const patientName = `${patient.firstName} ${patient.lastName}`;

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${patient.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Galeria de fotos do paciente
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
                {patientName}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                Consulte as imagens clínicas enviadas, filtre por categoria e abra cada
                foto para visualizar detalhes ou remover do histórico.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/patients/${patient.id}/photos/compare`}
                className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Comparar fotos
              </Link>
              <Link
                href={`/patients/${patient.id}/photos/upload`}
                className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
              >
                Enviar fotos
              </Link>
            </div>
          </div>
        </div>

        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {filterOptions.map((option) => {
              const href = option.value
                ? `/patients/${patient.id}/photos?category=${option.value}`
                : `/patients/${patient.id}/photos`;
              const isActive =
                selectedCategory === option.value ||
                (!selectedCategory && !option.value);

              return (
                <Link
                  key={option.label}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-brand-700 text-white"
                      : "border border-brand-100 text-brand-700 hover:bg-brand-50"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>

          {photos.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-brand-100 px-6 py-10 text-center">
              <h2 className="text-lg font-semibold text-brand-900">
                Nenhuma foto encontrada
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Envie a primeira imagem clínica ou altere o filtro de categoria.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {photos.map((photo) => (
                <Link
                  key={photo.id}
                  href={`/patients/${patient.id}/photos/${photo.id}`}
                  className="rounded-3xl border border-brand-100 p-4 transition hover:border-brand-300"
                >
                  <img
                    src={getPatientPhotoFileUrl(patient.id, photo.id)}
                    alt={photo.originalFileName}
                    className="h-64 w-full rounded-2xl object-cover"
                  />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-brand-900">
                        {photo.originalFileName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Data da captura: {formatDate(photo.captureDate)}
                      </p>
                    </div>
                    <PhotoCategoryBadge category={photo.category} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {photo.notes || "Nenhuma observação registrada."}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar as fotos do paciente.";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <Link
            href={`/patients/${params.id}`}
            className="text-sm font-medium text-brand-700"
          >
            Voltar para o paciente
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Galeria de fotos indisponível
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}
