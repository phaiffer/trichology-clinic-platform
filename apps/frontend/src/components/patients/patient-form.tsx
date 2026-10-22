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
            ? "Não foi possível atualizar o paciente"
            : "Não foi possível cadastrar o paciente",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof PatientInput>(
    key: K,
    value: PatientInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-brand-100 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nome"
          value={form.firstName}
          onChange={(value) => updateField("firstName", value)}
          required
        />
        <Field
          label="Sobrenome"
          value={form.lastName}
          onChange={(value) => updateField("lastName", value)}
          required
        />
        <Field
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          required
        />
        <Field
          label="Telefone"
          value={form.phone ?? ""}
          onChange={(value) => updateField("phone", value || null)}
        />
        <Field
          label="Data de nascimento"
          type="date"
          value={form.birthDate ?? ""}
          onChange={(value) => updateField("birthDate", value || null)}
        />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Gênero</span>
          <select
            value={form.gender ?? ""}
            onChange={(event) => updateField("gender", event.target.value || null)}
            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none ring-0 transition focus:border-brand-500"
          >
            <option value="">Não informado</option>
            <option value="FEMALE">Feminino</option>
            <option value="MALE">Masculino</option>
            <option value="NON_BINARY">Não binário</option>
            <option value="OTHER">Outro</option>
            <option value="PREFER_NOT_TO_SAY">Prefiro não informar</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">
          Observações clínicas
        </span>
        <textarea
          value={form.notes ?? ""}
          onChange={(event) => updateField("notes", event.target.value || null)}
          className="min-h-28 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none ring-0 transition focus:border-brand-500"
          placeholder="Observações clínicas relevantes sobre o paciente"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.consentAccepted}
            onChange={(event) =>
              updateField("consentAccepted", event.target.checked)
            }
            className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
            required
          />
          Consentimento LGPD coletado para cadastro e acompanhamento clínico.
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => updateField("active", event.target.checked)}
            className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
          />
          Paciente ativo
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Salvando alterações..."
              : "Salvando..."
            : mode === "edit"
              ? "Salvar alterações"
              : "Cadastrar paciente"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Cancelar
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: FieldProps) {
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
