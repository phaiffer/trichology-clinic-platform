"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createPatientAnamnesisRecord } from "@/lib/api";
import {
  AnamnesisTemplate,
  PatientAnamnesisRecordInput,
  QuestionType,
} from "@/lib/types";

type AnswerValue = string | number | boolean | string[] | null;

type PatientAnamnesisFormProps = {
  patientId: string;
  patientName: string;
  templates: AnamnesisTemplate[];
  initialTemplateId?: string;
};

export function PatientAnamnesisForm({
  patientId,
  patientName,
  templates,
  initialTemplateId,
}: PatientAnamnesisFormProps) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialTemplateId ?? templates[0]?.id ?? "",
  );
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  function updateAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTemplate) {
      setError("Select an anamnesis template first.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const payload: PatientAnamnesisRecordInput = {
      templateId: selectedTemplate.id,
      answers: selectedTemplate.questions.map((question) => ({
        questionId: question.id,
        value: answers[question.id] ?? null,
      })),
    };

    try {
      const record = await createPatientAnamnesisRecord(patientId, payload);
      router.push(`/patients/${patientId}/anamnesis/${record.id}`);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save anamnesis",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">
              Patient anamnesis
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-900">
              {patientName}
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              Select a template and answer the dynamic clinical intake questions for
              this patient.
            </p>
          </div>

          <label className="block min-w-72 space-y-2">
            <span className="text-sm font-medium text-slate-700">Template</span>
            <select
              value={selectedTemplateId}
              onChange={(event) => {
                setSelectedTemplateId(event.target.value);
                setAnswers({});
              }}
              className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {selectedTemplate ? (
        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-brand-900">
              {selectedTemplate.name}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {selectedTemplate.description || "No template description provided."}
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {selectedTemplate.questions.map((question) => (
              <div key={question.id} className="space-y-2 rounded-3xl border border-brand-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <label className="text-sm font-semibold text-brand-900">
                      {question.displayOrder}. {question.label}
                    </label>
                    {question.helperText ? (
                      <p className="mt-1 text-sm text-slate-500">{question.helperText}</p>
                    ) : null}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {question.type}
                  </span>
                </div>

                {renderQuestionField(question.type, {
                  questionId: question.id,
                  options: question.options,
                  value: answers[question.id] ?? null,
                  required: question.required,
                  onChange: (value) => updateAnswer(question.id, value),
                })}
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm text-sm text-slate-500">
          No active templates available yet.
        </section>
      )}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !selectedTemplate}
          className="rounded-full bg-brand-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving anamnesis..." : "Save anamnesis"}
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

type FieldRendererProps = {
  questionId: string;
  options: string[];
  value: AnswerValue;
  required: boolean;
  onChange: (value: AnswerValue) => void;
};

function renderQuestionField(type: QuestionType, props: FieldRendererProps) {
  switch (type) {
    case "TEXT":
      return (
        <input
          type="text"
          value={typeof props.value === "string" ? props.value : ""}
          onChange={(event) => props.onChange(event.target.value || null)}
          required={props.required}
          className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
        />
      );
    case "TEXTAREA":
      return (
        <textarea
          value={typeof props.value === "string" ? props.value : ""}
          onChange={(event) => props.onChange(event.target.value || null)}
          required={props.required}
          className="min-h-28 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
        />
      );
    case "NUMBER":
      return (
        <input
          type="number"
          value={typeof props.value === "number" ? String(props.value) : ""}
          onChange={(event) =>
            props.onChange(event.target.value === "" ? null : Number(event.target.value))
          }
          required={props.required}
          className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
        />
      );
    case "DATE":
      return (
        <input
          type="date"
          value={typeof props.value === "string" ? props.value : ""}
          onChange={(event) => props.onChange(event.target.value || null)}
          required={props.required}
          className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
        />
      );
    case "BOOLEAN":
      return (
        <div className="flex gap-4">
          <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="radio"
              name={props.questionId}
              checked={props.value === true}
              onChange={() => props.onChange(true)}
              className="h-4 w-4 border-brand-200 text-brand-700 focus:ring-brand-500"
            />
            Yes
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="radio"
              name={props.questionId}
              checked={props.value === false}
              onChange={() => props.onChange(false)}
              className="h-4 w-4 border-brand-200 text-brand-700 focus:ring-brand-500"
            />
            No
          </label>
        </div>
      );
    case "SINGLE_CHOICE":
      return (
        <div className="space-y-2">
          {props.options.map((option) => (
            <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="radio"
                name={props.questionId}
                checked={props.value === option}
                onChange={() => props.onChange(option)}
                required={props.required}
                className="h-4 w-4 border-brand-200 text-brand-700 focus:ring-brand-500"
              />
              {option}
            </label>
          ))}
        </div>
      );
    case "MULTIPLE_CHOICE":
      return (
        <div className="space-y-2">
          {props.options.map((option) => {
            const currentValue = Array.isArray(props.value) ? props.value : [];
            const checked = currentValue.includes(option);

            return (
              <label key={option} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const nextValues = event.target.checked
                      ? [...currentValue, option]
                      : currentValue.filter((item) => item !== option);
                    props.onChange(nextValues.length > 0 ? nextValues : null);
                  }}
                  className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
                />
                {option}
              </label>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}
