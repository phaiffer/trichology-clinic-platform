import Link from "next/link";
import { getServerPatients } from "@/lib/server-api";
import { PaginationControls } from "@/components/patients/pagination-controls";
import { PatientSearchForm } from "@/components/patients/patient-search-form";

type PatientsPageProps = {
  searchParams?: {
    search?: string;
    page?: string;
    size?: string;
  };
};

function normalizePage(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeSize(value?: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 50 ? parsed : 10;
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const search = searchParams?.search?.trim() ?? "";
  const page = normalizePage(searchParams?.page);
  const size = normalizeSize(searchParams?.size);

  try {
    const patientPage = await getServerPatients({ search, page, size });

    return (
      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Pacientes
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
                Cadastro e gestão de pacientes
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Pesquise pelo nome do paciente, navegue pelos prontuários e abra cada
                ficha para consulta, avaliação tricológica ou edição.
              </p>
            </div>

            <Link
              href="/patients/new"
              className="inline-flex self-start rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 md:self-auto"
            >
              Novo paciente
            </Link>
          </div>

          <PatientSearchForm defaultValue={search} />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.3fr_1.1fr_1.4fr_0.8fr_0.7fr] gap-4 border-b border-brand-100 px-6 py-4 text-sm font-semibold text-slate-500 md:grid">
            <span>Nome</span>
            <span>Telefone</span>
            <span>E-mail</span>
            <span>Status</span>
            <span>Ações</span>
          </div>

          {patientPage.content.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              {search
                ? `Nenhum paciente encontrado para "${search}".`
                : "Nenhum paciente cadastrado ainda. Crie o primeiro paciente para iniciar o atendimento."}
            </div>
          ) : (
            patientPage.content.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-col gap-2 border-b border-brand-50 px-5 py-4 text-sm text-slate-700 last:border-b-0 md:grid md:grid-cols-[1.3fr_1.1fr_1.4fr_0.8fr_0.7fr] md:items-center md:gap-4 md:px-6"
              >
                <div className="flex items-center justify-between gap-2 md:block">
                  <span className="font-medium text-brand-900">
                    {patient.firstName} {patient.lastName}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold md:hidden ${
                      patient.active
                        ? "bg-brand-50 text-brand-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {patient.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <span className="text-slate-600 md:text-slate-700">
                  {patient.phone || "-"}
                </span>
                <span className="break-all text-slate-600 md:text-slate-700">
                  {patient.email}
                </span>
                <span className="hidden md:inline">
                  {patient.active ? "Ativo" : "Inativo"}
                </span>
                <div className="pt-1 md:pt-0">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Abrir prontuário
                  </Link>
                </div>
              </div>
            ))
          )}

          <PaginationControls
            page={patientPage.page}
            size={patientPage.size}
            totalPages={patientPage.totalPages}
            hasNext={patientPage.hasNext}
            hasPrevious={patientPage.hasPrevious}
            search={search}
          />
        </div>
      </section>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível carregar os pacientes";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
            Pacientes
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-900 sm:text-3xl">
            Cadastro e gestão de pacientes
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}
