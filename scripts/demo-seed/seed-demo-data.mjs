#!/usr/bin/env node
/**
 * Script de carga fictícia (demo seed) para o Trichology Clinic Platform.
 *
 * Requisitos:
 * - Node.js 20+
 * - Variável de ambiente DEMO_ADMIN_PASSWORD definida (mesma senha configurada em
 *   APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD no backend).
 *
 * Variáveis opcionais:
 * - API_BASE_URL (padrão: http://localhost:18080/api)
 * - DEMO_ADMIN_EMAIL (padrão: admin@exemplo.test)
 *
 * Uso:
 *   DEMO_ADMIN_PASSWORD="<sua-senha-local>" node scripts/demo-seed/seed-demo-data.mjs
 */

const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:18080/api").replace(
  /\/+$/,
  "",
);
const ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL ?? "admin@exemplo.test";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD || !ADMIN_PASSWORD.trim()) {
  console.error(
    "Erro: defina a variável de ambiente DEMO_ADMIN_PASSWORD antes de executar o seed.",
  );
  console.error(
    'Exemplo: DEMO_ADMIN_PASSWORD="<senha-do-admin>" node scripts/demo-seed/seed-demo-data.mjs',
  );
  process.exit(1);
}

// Imagens PNG geométricas sintéticas (320x200, grade técnica em tons verdes, totalmente fictícias)
const SYNTHETIC_BEFORE_PNG_BASE64 =
  "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";

const SYNTHETIC_PROGRESS_PNG_BASE64 =
  "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";

let sessionCookie = "";

function extractSessionCookie(headers) {
  const setCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie")]
        : [];

  for (const raw of setCookies) {
    if (!raw) continue;
    const firstPart = raw.split(";")[0];
    if (firstPart) {
      sessionCookie = firstPart;
      return;
    }
  }
}

async function apiJson(path, options = {}) {
  const headers = new Headers(options.headers ?? {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (sessionCookie) {
    headers.set("Cookie", sessionCookie);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  extractSessionCookie(response.headers);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha em ${options.method ?? "GET"} ${path} (${response.status}): ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function uploadDemoPhoto(
  patientId,
  { fileName, category, captureDate, notes, anamnesisRecordId, base64Content },
) {
  const formData = new FormData();
  const binary = Buffer.from(
    base64Content ?? SYNTHETIC_BEFORE_PNG_BASE64,
    "base64",
  );
  const blob = new Blob([binary], { type: "image/png" });
  formData.append("files", blob, fileName);
  formData.set("category", category);
  if (captureDate) formData.set("captureDate", captureDate);
  if (notes) formData.set("notes", notes);
  if (anamnesisRecordId) formData.set("anamnesisRecordId", anamnesisRecordId);

  const headers = new Headers();
  if (sessionCookie) {
    headers.set("Cookie", sessionCookie);
  }

  const response = await fetch(`${API_BASE_URL}/patients/${patientId}/photos`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no upload de foto (${response.status}): ${errorText}`);
  }

  return response.json();
}

const DEMO_PATIENTS = [
  {
    firstName: "Helena",
    lastName: "Moreira (Exemplo)",
    email: "helena.moreira@exemplo.test",
    phone: "(11) 90000-0001",
    birthDate: "1989-05-14",
    gender: "FEMALE",
    notes:
      "Paciente fictícia para demonstração. Queixa principal de rarefação difusa em região frontoparietal há cerca de 6 meses, associada a período de sobrecarga profissional.",
    consentAccepted: true,
    active: true,
  },
  {
    firstName: "Rafael",
    lastName: "Nogueira (Exemplo)",
    email: "rafael.nogueira@exemplo.test",
    phone: "(11) 90000-0002",
    birthDate: "1984-09-22",
    gender: "MALE",
    notes:
      "Paciente fictício de exemplo. Recessão bitemporal progressiva com histórico familiar positivo para alopecia androgenética.",
    consentAccepted: true,
    active: true,
  },
  {
    firstName: "Camila",
    lastName: "Tavares (Exemplo)",
    email: "camila.tavares@exemplo.test",
    phone: "(11) 90000-0003",
    birthDate: "1993-02-08",
    gender: "FEMALE",
    notes:
      "Paciente fictícia de exemplo. Relato de queda acentuada pós-quadro infeccioso febril há 3 meses, compatível com eflúvio telógeno agudo.",
    consentAccepted: true,
    active: true,
  },
  {
    firstName: "Bruno",
    lastName: "Almeida (Exemplo)",
    email: "bruno.almeida@exemplo.test",
    phone: "(11) 90000-0004",
    birthDate: "1978-11-30",
    gender: "MALE",
    notes:
      "Paciente fictício de exemplo. Descamação e sensibilidade em couro cabeludo com melhora parcial após ajuste de rotina de higienização.",
    consentAccepted: true,
    active: true,
  },
  {
    firstName: "Larissa",
    lastName: "Cardoso (Exemplo)",
    email: "larissa.cardoso@exemplo.test",
    phone: "(11) 90000-0005",
    birthDate: "1996-07-19",
    gender: "FEMALE",
    notes:
      "Paciente fictícia de exemplo. Acompanhamento preventivo de densidade capilar e fortalecimento da haste.",
    consentAccepted: true,
    active: true,
  },
];

const DEMO_TEMPLATE = {
  name: "Avaliação capilar inicial",
  description:
    "Questionário clínico estruturado para triagem tricológica inicial, avaliação de intensidade de queda, sinais do couro cabeludo e cálculo de pontuação de risco.",
  active: true,
  questions: [
    {
      label: "Intensidade percebida da queda capilar",
      helperText:
        "Classifique o volume de fios observados no banho, travesseiro ou escovação.",
      type: "SINGLE_CHOICE",
      required: true,
      displayOrder: 1,
      scoringWeight: 1.5,
      options: ["Leve", "Moderada", "Intensa"],
      optionScores: {
        Leve: 1.0,
        Moderada: 4.0,
        Intensa: 6.0,
      },
    },
    {
      label: "Episódios frequentes de prurido ou sensibilidade no couro cabeludo",
      helperText:
        "Indique se há coceira, ardor ou dor à tração nos últimos 30 dias.",
      type: "BOOLEAN",
      required: true,
      displayOrder: 2,
      scoringWeight: 2.0,
      options: [],
      optionScores: {},
    },
    {
      label: "Tempo de evolução da queixa (em meses)",
      helperText: "Informe há quantos meses iniciou a percepção de rarefação ou queda.",
      type: "NUMBER",
      required: true,
      displayOrder: 3,
      scoringWeight: 0.5,
      options: [],
      optionScores: {},
    },
    {
      label: "Histórico clínico, hábitos e tratamentos anteriores",
      helperText:
        "Descreva rotina de lavagem, procedimentos químicos, suplementação e exames recentes.",
      type: "TEXTAREA",
      required: false,
      displayOrder: 4,
      scoringWeight: null,
      options: [],
      optionScores: {},
    },
  ],
};

async function main() {
  console.log(`Conectando em ${API_BASE_URL} como ${ADMIN_EMAIL}...`);

  await apiJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  console.log("Autenticado com sucesso.");

  // 1. Pacientes (idempotente por e-mail)
  const existingPage = await apiJson("/patients?page=0&size=50");
  const existingByEmail = new Map(
    (existingPage.content ?? []).map((p) => [p.email.toLowerCase(), p]),
  );

  const patients = [];
  for (const candidate of DEMO_PATIENTS) {
    const found = existingByEmail.get(candidate.email.toLowerCase());
    if (found) {
      const updated = await apiJson(`/patients/${found.id}`, {
        method: "PUT",
        body: JSON.stringify(candidate),
      });
      patients.push(updated);
      console.log(`Paciente atualizado: ${updated.firstName} ${updated.lastName} (${updated.id})`);
    } else {
      const created = await apiJson("/patients", {
        method: "POST",
        body: JSON.stringify(candidate),
      });
      patients.push(created);
      console.log(`Paciente criado: ${created.firstName} ${created.lastName} (${created.id})`);
    }
  }

  const primaryPatient = patients[0];

  // 2. Modelo de anamnese (idempotente por nome)
  const templates = await apiJson("/anamnesis/templates");
  let template = templates.find(
    (item) => item.name.toLowerCase() === DEMO_TEMPLATE.name.toLowerCase(),
  );

  if (!template) {
    template = await apiJson("/anamnesis/templates", {
      method: "POST",
      body: JSON.stringify(DEMO_TEMPLATE),
    });
    console.log(`Modelo de anamnese criado: ${template.name} (${template.id})`);
  } else {
    console.log(`Modelo de anamnese existente reutilizado: ${template.name} (${template.id})`);
  }

  // 3. Registro de anamnese para a paciente principal (idempotente)
  const existingRecords = await apiJson(
    `/patients/${primaryPatient.id}/anamnesis-records`,
  );
  let record = existingRecords.find((r) => r.templateId === template.id);

  if (!record) {
    const questionsByOrder = new Map(
      template.questions.map((q) => [q.displayOrder, q]),
    );

    // Cálculo esperado:
    // Q1 (SINGLE_CHOICE): "Moderada" (4,0) * peso 1,5 = 6,0
    // Q2 (BOOLEAN): true * peso 2,0 = 2,0
    // Q3 (NUMBER): 8 * peso 0,5 = 4,0
    // Total = 12,0 -> MODERATE
    const answersPayload = [
      {
        questionId: questionsByOrder.get(1).id,
        value: "Moderada",
      },
      {
        questionId: questionsByOrder.get(2).id,
        value: true,
      },
      {
        questionId: questionsByOrder.get(3).id,
        value: 8,
      },
      {
        questionId: questionsByOrder.get(4).id,
        value:
          "Lavagem em dias alternados; sem procedimentos químicos nos últimos 12 meses. Relata queda mais perceptível na linha frontal e redução de volume global nos últimos 8 meses.",
      },
    ];

    record = await apiJson(`/patients/${primaryPatient.id}/anamnesis-records`, {
      method: "POST",
      body: JSON.stringify({
        templateId: template.id,
        answers: answersPayload,
      }),
    });
    console.log(`Registro de anamnese criado: ${record.id}`);
  } else {
    console.log(`Registro de anamnese existente reutilizado: ${record.id}`);
  }

  // 4. Cálculo de pontuação (idempotente)
  const existingScores = await apiJson(`/patients/${primaryPatient.id}/scores`);
  let score = existingScores.find((s) => s.anamnesisRecordId === record.id);

  if (!score) {
    score = await apiJson(
      `/patients/${primaryPatient.id}/anamnesis-records/${record.id}/scores`,
      {
        method: "POST",
      },
    );
    console.log(
      `Pontuação calculada: ${score.totalScore} (${score.classification}) - ID ${score.id}`,
    );
  } else {
    console.log(
      `Pontuação existente reutilizada: ${score.totalScore} (${score.classification}) - ID ${score.id}`,
    );
  }

  // 5. Fotos clínicas sintéticas (para compor galeria e relatório de 2 páginas)
  const existingPhotos = await apiJson(`/patients/${primaryPatient.id}/photos`);
  let photos = existingPhotos;

  if (photos.length === 0) {
    const uploadedBefore = await uploadDemoPhoto(primaryPatient.id, {
      fileName: "avaliacao-inicial-frontal-exemplo.png",
      category: "BEFORE",
      captureDate: "2026-04-10",
      notes:
        "Registro sintético de demonstração (região frontoparietal antes do protocolo clínico).",
      anamnesisRecordId: record.id,
      base64Content: SYNTHETIC_BEFORE_PNG_BASE64,
    });
    const uploadedProgress = await uploadDemoPhoto(primaryPatient.id, {
      fileName: "acompanhamento-90-dias-exemplo.png",
      category: "PROGRESS",
      captureDate: "2026-07-15",
      notes:
        "Registro sintético de demonstração (acompanhamento de 90 dias com estabilização da queda).",
      anamnesisRecordId: record.id,
      base64Content: SYNTHETIC_PROGRESS_PNG_BASE64,
    });
    photos = [...uploadedBefore, ...uploadedProgress];
    console.log(`Fotos sintéticas criadas: ${photos.length}`);
  } else {
    console.log(`Fotos existentes reutilizadas: ${photos.length}`);
  }

  // 6. Relatório clínico PDF (2 páginas com anamnese, pontuação e fotos)
  const existingReports = await apiJson(`/patients/${primaryPatient.id}/reports`);
  let report = existingReports.find(
    (item) =>
      item.title === "Avaliação Clínica Capilar — Helena Moreira (Exemplo)" &&
      item.anamnesisRecordId === record.id &&
      item.scoreResultId === score.id,
  );

  if (!report) {
    report = await apiJson(`/patients/${primaryPatient.id}/reports`, {
      method: "POST",
      body: JSON.stringify({
        anamnesisRecordId: record.id,
        scoreResultId: score.id,
        selectedPhotoIds: photos.slice(0, 2).map((p) => p.id),
        title: "Avaliação Clínica Capilar — Helena Moreira (Exemplo)",
        summary:
          "Quadro clínico compatível com eflúvio telógeno associado a rarefação frontoparietal de grau moderado (escore 12,00 — Moderado). Indicado protocolo tópico de estímulo folicular, controle inflamatório do couro cabeludo e reavaliação tricológica em 90 dias.",
        reportType: "CLINICAL_EVALUATION",
      }),
    });
    console.log(`Relatório PDF gerado: ${report.title} (${report.id})`);
  } else {
    console.log(`Relatório PDF existente reutilizado: ${report.title} (${report.id})`);
  }

  const summaryOutput = {
    primaryPatientId: primaryPatient.id,
    templateId: template.id,
    anamnesisRecordId: record.id,
    scoreId: score.id,
    reportId: report.id,
  };

  console.log("\nResumo de IDs da carga fictícia:");
  console.log(JSON.stringify(summaryOutput, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
