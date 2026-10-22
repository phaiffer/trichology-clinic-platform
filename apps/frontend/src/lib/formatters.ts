import { PhotoCategory, QuestionType, ReportType, UserRole } from "@/lib/types";

const PT_BR_LOCALE = "pt-BR";
const BR_TIME_ZONE = "America/Sao_Paulo";

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00Z`
    : value;

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(PT_BR_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: /^\d{4}-\d{2}-\d{2}$/.test(value) ? "UTC" : BR_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return formatDate(value);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const datePart = new Intl.DateTimeFormat(PT_BR_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: BR_TIME_ZONE,
  }).format(date);

  const timePart = new Intl.DateTimeFormat(PT_BR_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: BR_TIME_ZONE,
  }).format(date);

  return `${datePart} às ${timePart}`;
}

export function formatDecimal(
  value: number | null | undefined,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat(PT_BR_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatFlexibleNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return new Intl.NumberFormat(PT_BR_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBoolean(value: boolean | string | null | undefined): string {
  if (value === true || value === "true" || value === "Yes" || value === "Sim") {
    return "Sim";
  }
  if (value === false || value === "false" || value === "No" || value === "Não") {
    return "Não";
  }
  return "-";
}

export function formatRole(role: UserRole | string | null | undefined): string {
  if (!role) {
    return "Usuário";
  }
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Administrador";
    case "CLINICIAN":
      return "Tricologista";
    case "STAFF":
      return "Equipe de apoio";
    default:
      return role;
  }
}

export function formatGender(gender: string | null | undefined): string {
  if (!gender || !gender.trim()) {
    return "-";
  }
  switch (gender.trim().toUpperCase()) {
    case "FEMALE":
    case "F":
    case "FEMININO":
      return "Feminino";
    case "MALE":
    case "M":
    case "MASCULINO":
      return "Masculino";
    case "NON_BINARY":
    case "NAO_BINARIO":
    case "NÃO BINÁRIO":
      return "Não binário";
    case "OTHER":
    case "OUTRO":
      return "Outro";
    case "PREFER_NOT_TO_SAY":
    case "PREFIRO_NAO_INFORMAR":
      return "Prefiro não informar";
    default:
      return gender;
  }
}

export function formatScoreClassification(
  classification: string | null | undefined,
): string {
  if (!classification) {
    return "Sem classificação";
  }
  switch (classification.toUpperCase()) {
    case "LOW":
      return "Baixo";
    case "MODERATE":
      return "Moderado";
    case "HIGH":
      return "Alto";
    case "UNCLASSIFIED":
      return "Sem classificação";
    default:
      return classification;
  }
}

export function formatQuestionType(type: QuestionType | string | null | undefined): string {
  if (!type) {
    return "-";
  }
  switch (type.toUpperCase()) {
    case "TEXT":
      return "Texto curto";
    case "TEXTAREA":
      return "Texto livre";
    case "NUMBER":
      return "Número";
    case "DATE":
      return "Data";
    case "SINGLE_CHOICE":
      return "Escolha única";
    case "MULTIPLE_CHOICE":
      return "Múltipla escolha";
    case "BOOLEAN":
      return "Sim / Não";
    default:
      return type;
  }
}

export function formatPhotoCategory(
  category: PhotoCategory | string | null | undefined,
): string {
  if (!category) {
    return "-";
  }
  switch (category.toUpperCase()) {
    case "BEFORE":
      return "Antes";
    case "AFTER":
      return "Depois";
    case "PROGRESS":
      return "Evolução";
    default:
      return category;
  }
}

export function formatReportType(type: ReportType | string | null | undefined): string {
  if (!type) {
    return "-";
  }
  switch (type.toUpperCase()) {
    case "CLINICAL_EVALUATION":
      return "Avaliação clínica";
    default:
      return type.replaceAll("_", " ");
  }
}

export function formatScoreType(scoreType: string | null | undefined): string {
  if (!scoreType || !scoreType.trim()) {
    return "-";
  }
  if (scoreType.endsWith(" score")) {
    return `Pontuação — ${scoreType.slice(0, -6)}`;
  }
  return scoreType;
}

export function formatScoreAnswerValue(
  answerValue: string | null | undefined,
  questionType?: QuestionType | string,
): string {
  if (answerValue === null || answerValue === undefined || answerValue === "") {
    return "-";
  }

  const trimmed = answerValue.trim();
  if (
    questionType === "BOOLEAN" ||
    trimmed === "Yes" ||
    trimmed === "No" ||
    trimmed === "true" ||
    trimmed === "false"
  ) {
    return formatBoolean(trimmed);
  }

  if (questionType === "DATE" && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return formatDate(trimmed);
  }

  if (questionType === "NUMBER" && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed)) {
      return formatFlexibleNumber(parsed);
    }
  }

  return answerValue;
}

export function formatScoreRuleApplied(ruleApplied: string | null | undefined): string {
  if (!ruleApplied) {
    return "-";
  }

  if (ruleApplied === "BOOLEAN answer matched the configured question weight") {
    return "Resposta Sim: aplica o peso configurado na pergunta.";
  }

  if (ruleApplied === "BOOLEAN answer evaluated as false, so it adds zero points") {
    return "Resposta Não: avaliada como falso, adiciona 0,00 ponto.";
  }

  const singleChoiceMatch = ruleApplied.match(
    /^SINGLE_CHOICE option score (-?\d+(?:[.,]\d+)?) multiplied by question weight (-?\d+(?:[.,]\d+)?)$/,
  );
  if (singleChoiceMatch) {
    const optionScore = formatDecimal(
      Number(singleChoiceMatch[1].replace(",", ".")),
    );
    const weight = formatDecimal(
      Number(singleChoiceMatch[2].replace(",", ".")),
    );
    return `Escolha única: pontuação da opção (${optionScore}) multiplicada pelo peso da pergunta (${weight}).`;
  }

  const multipleChoiceMatch = ruleApplied.match(
    /^MULTIPLE_CHOICE option score sum (-?\d+(?:[.,]\d+)?) multiplied by question weight (-?\d+(?:[.,]\d+)?)$/,
  );
  if (multipleChoiceMatch) {
    const sum = formatDecimal(
      Number(multipleChoiceMatch[1].replace(",", ".")),
    );
    const weight = formatDecimal(
      Number(multipleChoiceMatch[2].replace(",", ".")),
    );
    return `Múltipla escolha: soma das opções (${sum}) multiplicada pelo peso da pergunta (${weight}).`;
  }

  const numberMatch = ruleApplied.match(
    /^NUMBER answer (-?\d+(?:[.,]\d+)?) multiplied by question weight (-?\d+(?:[.,]\d+)?)$/,
  );
  if (numberMatch) {
    const answer = formatDecimal(
      Number(numberMatch[1].replace(",", ".")),
    );
    const weight = formatDecimal(
      Number(numberMatch[2].replace(",", ".")),
    );
    return `Valor numérico (${answer}) multiplicado pelo peso da pergunta (${weight}).`;
  }

  return ruleApplied.replace(/(\d+)\.(\d+)/g, "$1,$2");
}

export function formatScoreSummary(summary: string | null | undefined): string {
  if (!summary) {
    return "Nenhum resumo registrado para este resultado de pontuação.";
  }

  const fullMatch = summary.match(
    /^Calculated from (\d+) scored answers in template (.+?)\. Highest contribution: (.+?) \((-?\d+(?:[.,]\d+)?)\)\. Classification: ([A-Z_]+)\.$/,
  );

  if (fullMatch) {
    const count = Number(fullMatch[1]);
    const templateName = fullMatch[2];
    const highestLabel = fullMatch[3];
    const highestValue = formatDecimal(
      Number(fullMatch[4].replace(",", ".")),
    );
    const classification = formatScoreClassification(fullMatch[5]);
    const answersText =
      count === 1 ? "1 resposta pontuada" : `${count} respostas pontuadas`;
    return `Calculada a partir de ${answersText} no modelo "${templateName}". Maior contribuição: ${highestLabel} (${highestValue}). Classificação: ${classification}.`;
  }

  const noDetailsMatch = summary.match(
    /^Calculated from (\d+) scored answers in template (.+?)\. No contributing question details were stored\. Classification: ([A-Z_]+)\.$/,
  );

  if (noDetailsMatch) {
    const count = Number(noDetailsMatch[1]);
    const templateName = noDetailsMatch[2];
    const classification = formatScoreClassification(noDetailsMatch[3]);
    const answersText =
      count === 1 ? "1 resposta pontuada" : `${count} respostas pontuadas`;
    return `Calculada a partir de ${answersText} no modelo "${templateName}". Nenhum detalhe de pergunta contribuinte foi armazenado. Classificação: ${classification}.`;
  }

  return summary
    .replace("Calculated from ", "Calculada a partir de ")
    .replace(" scored answers in template ", " respostas pontuadas no modelo ")
    .replace("Highest contribution: ", "Maior contribuição: ")
    .replace("Classification: LOW", "Classificação: Baixo")
    .replace("Classification: MODERATE", "Classificação: Moderado")
    .replace("Classification: HIGH", "Classificação: Alto")
    .replace(/(\d+)\.(\d{2})/g, "$1,$2");
}

export function translateApiErrorMessage(message: string): string {
  if (!message) {
    return "Não foi possível concluir a solicitação.";
  }

  const translations: Record<string, string> = {
    "Request failed": "Falha na comunicação com o servidor.",
    "Invalid email or password": "E-mail ou senha inválidos.",
    "Authentication is required": "Autenticação obrigatória.",
    "Access is denied": "Acesso negado.",
    "Inactive templates cannot be used for new anamnesis submissions":
      "Modelos inativos não podem ser utilizados em novos registros de anamnese.",
    "This anamnesis record cannot be scored because no supported scoring configuration was found":
      "Este registro de anamnese não possui perguntas configuradas para cálculo de pontuação.",
    "Selected score result must belong to the selected anamnesis record":
      "A pontuação selecionada deve pertencer ao registro de anamnese escolhido.",
    "One or more selected patient photos were not found":
      "Uma ou mais fotos selecionadas do paciente não foram encontradas.",
    "Report title is required": "O título do relatório é obrigatório.",
  };

  if (translations[message]) {
    return translations[message];
  }

  return message
    .replace(/^Patient not found: /, "Paciente não encontrado: ")
    .replace(/^Patient photo not found: /, "Foto do paciente não encontrada: ")
    .replace(/^Report not found: /, "Relatório não encontrado: ")
    .replace(/^Score result not found: /, "Resultado de pontuação não encontrado: ")
    .replace(
      /^Patient anamnesis record not found: /,
      "Registro de anamnese não encontrado: ",
    )
    .replace(
      /^Patient email is already registered: /,
      "O e-mail informado já está cadastrado: ",
    )
    .replace(
      /^Required question is missing an answer: /,
      "Pergunta obrigatória sem resposta: ",
    )
    .replace(/^Unsupported file type: /, "Formato de arquivo não suportado: ");
}
