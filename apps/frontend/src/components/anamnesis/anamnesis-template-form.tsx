"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createAnamnesisTemplate, updateAnamnesisTemplate } from "@/lib/api";
import { formatQuestionType } from "@/lib/formatters";
import {
  AnamnesisQuestion,
  AnamnesisQuestionInput,
  AnamnesisTemplate,
  AnamnesisTemplateInput,
  QuestionType,
} from "@/lib/types";

const questionTypes: QuestionType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "BOOLEAN",
];

function createQuestion(order: number): AnamnesisQuestionInput {
  return {
    label: "",
    helperText: null,
    type: "TEXT",
    required: false,
    displayOrder: order,
    scoringWeight: null,
    options: [],
    optionScores: {},
  };
}

function mapQuestion(question: AnamnesisQuestion): AnamnesisQuestionInput {
  return {
    id: question.id,
    label: question.label,
    helperText: question.helperText,
    type: question.type,
    required: question.required,
    displayOrder: question.displayOrder,
    scoringWeight: question.scoringWeight,
    options: [...question.options],
    optionScores: { ...question.optionScores },
  };
}

function buildInitialForm(template?: AnamnesisTemplate): AnamnesisTemplateInput {
  if (!template) {
    return {
      name: "",
      description: null,
      active: true,
      questions: [createQuestion(1)],
    };
  }

  const questions = [...template.questions]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map(mapQuestion);

  return {
    name: template.name,
    description: template.description,
    active: template.active,
    questions: questions.length > 0 ? questions : [createQuestion(1)],
  };
}

type AnamnesisTemplateFormProps = {
  mode?: "create" | "edit";
  template?: AnamnesisTemplate;
};

export function AnamnesisTemplateForm({
  mode = "create",
  template,
}: AnamnesisTemplateFormProps) {
  const router = useRouter();
  const initialForm = useMemo(() => buildInitialForm(template), [template]);
  const [form, setForm] = useState<AnamnesisTemplateInput>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateQuestion(
    index: number,
    updater: (question: AnamnesisQuestionInput) => AnamnesisQuestionInput,
  ) {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? updater(question) : question,
      ),
    }));
  }

  function addQuestion() {
    setForm((current) => ({
      ...current,
      questions: [...current.questions, createQuestion(current.questions.length + 1)],
    }));
  }

  function removeQuestion(index: number) {
    setForm((current) => ({
      ...current,
      questions: current.questions.filter((_, questionIndex) => questionIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: AnamnesisTemplateInput = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || null,
      questions: [...form.questions]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((question) => ({
          ...question,
          label: question.label.trim(),
          helperText: question.helperText?.trim() || null,
          options: question.options,
          optionScores: Object.fromEntries(
            Object.entries(question.optionScores).filter(([option]) =>
              question.options.includes(option),
            ),
          ),
        })),
    };

    try {
      if (mode === "edit" && template) {
        await updateAnamnesisTemplate(template.id, payload);
        router.push(`/anamnesis/templates/${template.id}`);
      } else {
        await createAnamnesisTemplate(payload);
        router.push("/anamnesis");
      }

      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : mode === "edit"
            ? "Não foi possível atualizar o modelo de anamnese"
            : "Não foi possível criar o modelo de anamnese",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "edit" ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Os registros de anamnese já preenchidos preservam os enunciados e os pesos
          vigentes no momento do atendimento, mantendo a integridade das pontuações e
          dos relatórios emitidos.
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Nome do modelo"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            required
          />

          <label className="flex items-center gap-3 rounded-2xl border border-brand-100 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm((current) => ({ ...current, active: event.target.checked }))
              }
              className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
            />
            Modelo ativo
          </label>
        </div>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-slate-700">Descrição</span>
          <textarea
            value={form.description ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value || null,
              }))
            }
            className="min-h-24 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
            placeholder="Objetivo clínico deste modelo de anamnese"
          />
        </label>
      </section>

      <section className="rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-brand-900">Perguntas</h2>
            <p className="mt-2 text-sm text-slate-600">
              Estruture o questionário ordenado que será apresentado no preenchimento
              da anamnese.
            </p>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="self-start rounded-full border border-brand-100 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 sm:self-auto"
          >
            Adicionar pergunta
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {form.questions.map((question, index) => {
            const choiceType =
              question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE";

            return (
              <article
                key={question.id ?? `new-${index}`}
                className="rounded-3xl border border-brand-100 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                      Pergunta {index + 1}
                    </p>
                    {question.id ? (
                      <p className="mt-1 text-xs text-slate-400">Pergunta existente</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Nova pergunta</p>
                    )}
                  </div>

                  {form.questions.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-sm font-medium text-red-700"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field
                    label="Enunciado"
                    value={question.label}
                    onChange={(value) =>
                      updateQuestion(index, (current) => ({ ...current, label: value }))
                    }
                    required
                  />

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Tipo</span>
                    <select
                      value={question.type}
                      onChange={(event) =>
                        updateQuestion(index, (current) => ({
                          ...current,
                          type: event.target.value as QuestionType,
                          options:
                            event.target.value === "SINGLE_CHOICE" ||
                            event.target.value === "MULTIPLE_CHOICE"
                              ? current.options
                              : [],
                          optionScores:
                            event.target.value === "SINGLE_CHOICE" ||
                            event.target.value === "MULTIPLE_CHOICE"
                              ? current.optionScores
                              : {},
                        }))
                      }
                      className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
                    >
                      {questionTypes.map((type) => (
                        <option key={type} value={type}>
                          {formatQuestionType(type)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Field
                    label="Texto de apoio"
                    value={question.helperText ?? ""}
                    onChange={(value) =>
                      updateQuestion(index, (current) => ({
                        ...current,
                        helperText: value || null,
                      }))
                    }
                  />

                  <Field
                    label="Ordem de exibição"
                    type="number"
                    value={String(question.displayOrder)}
                    onChange={(value) =>
                      updateQuestion(index, (current) => ({
                        ...current,
                        displayOrder: Number(value) || index + 1,
                      }))
                    }
                    required
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(event) =>
                        updateQuestion(index, (current) => ({
                          ...current,
                          required: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-brand-200 text-brand-700 focus:ring-brand-500"
                    />
                    Pergunta obrigatória
                  </label>

                  <Field
                    label="Peso na pontuação"
                    type="number"
                    value={question.scoringWeight?.toString() ?? ""}
                    onChange={(value) =>
                      updateQuestion(index, (current) => ({
                        ...current,
                        scoringWeight: value === "" ? null : Number(value),
                      }))
                    }
                  />
                </div>

                {choiceType ? (
                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-slate-700">
                      Opções (uma por linha)
                    </span>
                    <textarea
                      value={question.options.join("\n")}
                      onChange={(event) =>
                        updateQuestion(index, (current) => {
                          const nextOptions = event.target.value
                            .split("\n")
                            .map((option) => option.trim())
                            .filter((option) => option.length > 0);

                          return {
                            ...current,
                            options: nextOptions,
                            optionScores: Object.fromEntries(
                              nextOptions.map((option) => [
                                option,
                                current.optionScores[option] ?? 0,
                              ]),
                            ),
                          };
                        })
                      }
                      className="min-h-24 w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
                      placeholder={"Opção A\nOpção B"}
                    />
                  </label>
                ) : null}

                {choiceType && question.options.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      Pontuação por opção
                    </p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {question.options.map((option) => (
                        <label key={option} className="block space-y-2">
                          <span className="text-sm text-slate-600">{option}</span>
                          <input
                            type="number"
                            value={question.optionScores[option] ?? 0}
                            onChange={(event) =>
                              updateQuestion(index, (current) => ({
                                ...current,
                                optionScores: {
                                  ...current.optionScores,
                                  [option]:
                                    event.target.value === ""
                                      ? 0
                                      : Number(event.target.value),
                                },
                              }))
                            }
                            className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

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
              ? "Salvando modelo..."
              : "Criando modelo..."
            : mode === "edit"
              ? "Salvar alterações"
              : "Criar modelo"}
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
  required?: boolean;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-brand-100 px-4 py-3 outline-none transition focus:border-brand-500"
      />
    </label>
  );
}
