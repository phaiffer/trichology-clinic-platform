import "server-only";

import { cookies } from "next/headers";
import {
  AnamnesisTemplate,
  AuthenticatedUser,
  Patient,
  PatientAnamnesisRecord,
  PatientAnamnesisRecordListItem,
  PatientListQuery,
  PatientListResponse,
  PatientPhoto,
  PatientReport,
  PatientReportListItem,
  ScoreResult,
} from "@/lib/types";
import { ApiRequestError } from "@/lib/api-error";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function serverApiRequest<T>(path: string): Promise<T> {
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();
  const headers = new Headers();

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const fallbackMessage = "Request failed";
    let errorMessage = fallbackMessage;

    try {
      const error = await response.json();
      const details = Array.isArray(error.details)
        ? ` (${error.details.join(", ")})`
        : "";
      errorMessage = `${error.message ?? fallbackMessage}${details}`;
    } catch {
      errorMessage = fallbackMessage;
    }

    throw new ApiRequestError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildPatientListQuery(query: PatientListQuery): string {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("search", query.search);
  }

  if (typeof query.page === "number") {
    params.set("page", String(query.page));
  }

  if (typeof query.size === "number") {
    params.set("size", String(query.size));
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getServerCurrentUser(): Promise<AuthenticatedUser> {
  return serverApiRequest<AuthenticatedUser>("/auth/me");
}

export async function getServerPatients(query: PatientListQuery = {}): Promise<PatientListResponse> {
  return serverApiRequest<PatientListResponse>(`/patients${buildPatientListQuery(query)}`);
}

export async function getServerPatient(id: string): Promise<Patient> {
  return serverApiRequest<Patient>(`/patients/${id}`);
}

export async function getServerAnamnesisTemplates(): Promise<AnamnesisTemplate[]> {
  return serverApiRequest<AnamnesisTemplate[]>("/anamnesis/templates");
}

export async function getServerAnamnesisTemplate(id: string): Promise<AnamnesisTemplate> {
  return serverApiRequest<AnamnesisTemplate>(`/anamnesis/templates/${id}`);
}

export async function getServerPatientAnamnesisRecords(
  patientId: string,
): Promise<PatientAnamnesisRecordListItem[]> {
  return serverApiRequest<PatientAnamnesisRecordListItem[]>(
    `/patients/${patientId}/anamnesis-records`,
  );
}

export async function getServerPatientAnamnesisRecord(
  patientId: string,
  recordId: string,
): Promise<PatientAnamnesisRecord> {
  return serverApiRequest<PatientAnamnesisRecord>(
    `/patients/${patientId}/anamnesis-records/${recordId}`,
  );
}

export async function getServerPatientPhotos(
  patientId: string,
  category?: string,
): Promise<PatientPhoto[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return serverApiRequest<PatientPhoto[]>(`/patients/${patientId}/photos${query}`);
}

export async function getServerPatientPhoto(
  patientId: string,
  photoId: string,
): Promise<PatientPhoto> {
  return serverApiRequest<PatientPhoto>(`/patients/${patientId}/photos/${photoId}`);
}

export async function getServerPatientScoreResults(patientId: string): Promise<ScoreResult[]> {
  return serverApiRequest<ScoreResult[]>(`/patients/${patientId}/scores`);
}

export async function getServerPatientScoreResult(
  patientId: string,
  scoreId: string,
): Promise<ScoreResult> {
  return serverApiRequest<ScoreResult>(`/patients/${patientId}/scores/${scoreId}`);
}

export async function getServerPatientReports(
  patientId: string,
): Promise<PatientReportListItem[]> {
  return serverApiRequest<PatientReportListItem[]>(`/patients/${patientId}/reports`);
}

export async function getServerPatientReport(
  patientId: string,
  reportId: string,
): Promise<PatientReport> {
  return serverApiRequest<PatientReport>(`/patients/${patientId}/reports/${reportId}`);
}
