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
        <div className="flex flex-col gap-4 rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
                Patients
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-brand-900">
                Patient registration and management
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Search by patient name, paginate through records, and open each patient
                for review, editing, or deletion.
              </p>
            </div>

            <Link
              href="/patients/new"
              className="inline-flex rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
            >
              New patient
            </Link>
          </div>

          <PatientSearchForm defaultValue={search} />
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-brand-100 bg-white shadow-sm">
          <div className="grid grid-cols-[1.3fr_1.1fr_1.4fr_0.8fr_0.9fr] gap-4 border-b border-brand-100 px-6 py-4 text-sm font-semibold text-slate-500">
            <span>Name</span>
            <span>Phone</span>
            <span>Email</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {patientPage.content.length === 0 ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              {search
                ? `No patients found for "${search}".`
                : "No patients yet. Create the first patient to start the flow."}
            </div>
          ) : (
            patientPage.content.map((patient) => (
              <div
                key={patient.id}
                className="grid grid-cols-[1.3fr_1.1fr_1.4fr_0.8fr_0.9fr] gap-4 border-b border-brand-50 px-6 py-4 text-sm text-slate-700 last:border-b-0"
              >
                <span className="font-medium text-brand-900">
                  {patient.firstName} {patient.lastName}
                </span>
                <span>{patient.phone || "-"}</span>
                <span>{patient.email}</span>
                <span>{patient.active ? "Active" : "Inactive"}</span>
                <span>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="font-medium text-brand-700 transition hover:text-brand-900"
                  >
                    Open
                  </Link>
                </span>
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
      error instanceof Error ? error.message : "Unable to load patients";

    return (
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-brand-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
            Patients
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-brand-900">
            Patient registration and management
          </h1>
          <p className="mt-3 text-sm text-red-700">{message}</p>
        </div>
      </section>
    );
  }
}
