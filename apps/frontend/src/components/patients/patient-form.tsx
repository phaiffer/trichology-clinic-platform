"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient, updatePatient } from "@/lib/api";
import { PatientInput } from "@/lib/types";

const initialState: PatientInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: null,
  birthDate: null,
  gender: null,
  notes: null,
  consentAccepted: false,
  active: true,
};

type PatientFormProps = {
  mode: "create" | "edit";
  patientId?: string;
  initialValues?: PatientInput;
};

export function PatientForm({
  mode,
  patientId,
  initialValues = initialState,
}: PatientFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PatientInput>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "edit" && patientId) {
        await updatePatient(patientId, form);
        router.push(`/patients/${patientId}`);
      } else {
        await createPatient(form);
        router.push("/patients");
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : mode === "edit"
            ? "Unable to update patient"
            : "Unable to create patient",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof PatientInput>(key: K, value: PatientInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(value) => updateField("firstName", value)}
          required
        />
        <Field
          label="Last name"
          value={form.lastName}
          onChange={(value) => updateField("lastName", value)}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          required
        />
        <Field
          label="Phone"
          value={form.phone ?? ""}
          onChange={(value) => updateField("phone", value || null)}
        />
        <Field
          label="Birth date"
          type="date"
          value={form.birthDate ?? ""}
          onChange={(value) => updateField("birthDate", value || null)}
        />
        <Field
          label="Gender"
          value={form.gender ?? ""}
          onChange={(value) => updateField("gender", value || null)}
        />
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">Clinical notes</span>
        <textarea
          value={form.notes ?? ""}
          onChange={(event) => updateField("notes", event.target.value || null)}
          className="min-h-28 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none ring-0 transition focus:border-brand-500"
          placeholder="Relevant clinical observations"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.consentAccepted}
            onChange={(event) => updateField("consentAccepted", event.target.checked)}
            className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
            required
          />
          LGPD consent collected for patient registration and communication.
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => updateField("active", event.target.checked)}
            className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
          />
          Patient is active
        </label>
      </div>

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
          {isSubmitting
            ? mode === "edit"
              ? "Saving changes..."
              : "Saving..."
            : mode === "edit"
              ? "Save changes"
              : "Create patient"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function Field({ label, value, onChange, type = "text", required = false }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none ring-0 transition focus:border-brand-500"
      />
    </label>
  );
}

