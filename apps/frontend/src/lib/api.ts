import {
  AnamnesisTemplate,
  AnamnesisTemplateInput,
  Patient,
  PatientAnamnesisRecord,
  PatientAnamnesisRecordInput,
  PatientAnamnesisRecordListItem,
  PatientPhoto,
  PatientPhotoUploadInput,
  PatientReport,
  PatientReportInput,
  PatientReportListItem,
  PatientInput,
  PatientListQuery,
  PatientListResponse,
  ScoreResult,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
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

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function apiMultipartRequest<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData,
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

    throw new Error(errorMessage);
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

export async function getPatients(query: PatientListQuery = {}): Promise<PatientListResponse> {
  return apiRequest<PatientListResponse>(`/patients${buildPatientListQuery(query)}`);
}

export async function getPatient(id: string): Promise<Patient> {
  return apiRequest<Patient>(`/patients/${id}`);
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const payload = {
    ...input,
    phone: input.phone || null,
    birthDate: input.birthDate || null,
    gender: input.gender || null,
    notes: input.notes || null,
  };

  return apiRequest<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(id: string, input: PatientInput): Promise<Patient> {
  const payload = {
    ...input,
    phone: input.phone || null,
    birthDate: input.birthDate || null,
    gender: input.gender || null,
    notes: input.notes || null,
  };

  return apiRequest<Patient>(`/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePatient(id: string): Promise<void> {
  return apiRequest<void>(`/patients/${id}`, {
    method: "DELETE",
  });
}

export async function getAnamnesisTemplates(): Promise<AnamnesisTemplate[]> {
  return apiRequest<AnamnesisTemplate[]>("/anamnesis/templates");
}

export async function getAnamnesisTemplate(id: string): Promise<AnamnesisTemplate> {
  return apiRequest<AnamnesisTemplate>(`/anamnesis/templates/${id}`);
}

export async function createAnamnesisTemplate(
  input: AnamnesisTemplateInput,
): Promise<AnamnesisTemplate> {
  return apiRequest<AnamnesisTemplate>("/anamnesis/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAnamnesisTemplate(
  id: string,
  input: AnamnesisTemplateInput,
): Promise<AnamnesisTemplate> {
  return apiRequest<AnamnesisTemplate>(`/anamnesis/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function updateAnamnesisTemplateStatus(
  id: string,
  active: boolean,
): Promise<AnamnesisTemplate> {
  return apiRequest<AnamnesisTemplate>(`/anamnesis/templates/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function getPatientAnamnesisRecords(
  patientId: string,
): Promise<PatientAnamnesisRecordListItem[]> {
  return apiRequest<PatientAnamnesisRecordListItem[]>(
    `/patients/${patientId}/anamnesis-records`,
  );
}

export async function getPatientAnamnesisRecord(
  patientId: string,
  recordId: string,
): Promise<PatientAnamnesisRecord> {
  return apiRequest<PatientAnamnesisRecord>(
    `/patients/${patientId}/anamnesis-records/${recordId}`,
  );
}

export async function createPatientAnamnesisRecord(
  patientId: string,
  input: PatientAnamnesisRecordInput,
): Promise<PatientAnamnesisRecord> {
  return apiRequest<PatientAnamnesisRecord>(
    `/patients/${patientId}/anamnesis-records`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

function buildPhotoListQuery(category?: string): string {
  if (!category) {
    return "";
  }

  const params = new URLSearchParams();
  params.set("category", category);
  return `?${params.toString()}`;
}

export function getPatientPhotoFileUrl(patientId: string, photoId: string): string {
  return `${API_BASE_URL}/patients/${patientId}/photos/${photoId}/file`;
}

export async function getPatientPhotos(
  patientId: string,
  category?: string,
): Promise<PatientPhoto[]> {
  return apiRequest<PatientPhoto[]>(
    `/patients/${patientId}/photos${buildPhotoListQuery(category)}`,
  );
}

export async function getPatientPhoto(
  patientId: string,
  photoId: string,
): Promise<PatientPhoto> {
  return apiRequest<PatientPhoto>(`/patients/${patientId}/photos/${photoId}`);
}

export async function uploadPatientPhotos(
  patientId: string,
  input: PatientPhotoUploadInput,
): Promise<PatientPhoto[]> {
  const formData = new FormData();

  input.files.forEach((file) => {
    formData.append("files", file);
  });

  formData.set("category", input.category);

  if (input.captureDate) {
    formData.set("captureDate", input.captureDate);
  }

  if (input.notes) {
    formData.set("notes", input.notes);
  }

  if (input.anamnesisRecordId) {
    formData.set("anamnesisRecordId", input.anamnesisRecordId);
  }

  return apiMultipartRequest<PatientPhoto[]>(`/patients/${patientId}/photos`, formData);
}

export async function deletePatientPhoto(
  patientId: string,
  photoId: string,
): Promise<void> {
  return apiRequest<void>(`/patients/${patientId}/photos/${photoId}`, {
    method: "DELETE",
  });
}

export async function getPatientScoreResults(patientId: string): Promise<ScoreResult[]> {
  return apiRequest<ScoreResult[]>(`/patients/${patientId}/scores`);
}

export async function getPatientScoreResult(
  patientId: string,
  scoreId: string,
): Promise<ScoreResult> {
  return apiRequest<ScoreResult>(`/patients/${patientId}/scores/${scoreId}`);
}

export async function createPatientScoreResult(
  patientId: string,
  recordId: string,
): Promise<ScoreResult> {
  return apiRequest<ScoreResult>(
    `/patients/${patientId}/anamnesis-records/${recordId}/scores`,
    {
      method: "POST",
    },
  );
}

export async function getPatientReports(
  patientId: string,
): Promise<PatientReportListItem[]> {
  return apiRequest<PatientReportListItem[]>(`/patients/${patientId}/reports`);
}

export async function getPatientReport(
  patientId: string,
  reportId: string,
): Promise<PatientReport> {
  return apiRequest<PatientReport>(`/patients/${patientId}/reports/${reportId}`);
}

export async function createPatientReport(
  patientId: string,
  input: PatientReportInput,
): Promise<PatientReport> {
  const payload = {
    ...input,
    anamnesisRecordId: input.anamnesisRecordId || null,
    scoreResultId: input.scoreResultId || null,
    summary: input.summary || null,
  };

  return apiRequest<PatientReport>(`/patients/${patientId}/reports`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deletePatientReport(
  patientId: string,
  reportId: string,
): Promise<void> {
  return apiRequest<void>(`/patients/${patientId}/reports/${reportId}`, {
    method: "DELETE",
  });
}

export function getPatientReportFileUrl(patientId: string, reportId: string): string {
  return `${API_BASE_URL}/patients/${patientId}/reports/${reportId}/file`;
}
