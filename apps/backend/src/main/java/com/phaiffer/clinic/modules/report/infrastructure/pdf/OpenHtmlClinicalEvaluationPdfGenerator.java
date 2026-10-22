package com.phaiffer.clinic.modules.report.infrastructure.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.phaiffer.clinic.shared.exception.report.ReportStorageException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Component
public class OpenHtmlClinicalEvaluationPdfGenerator implements ClinicalEvaluationPdfGenerator {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final ZoneId REPORT_ZONE = ZoneId.of("America/Sao_Paulo");
    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm", PT_BR).withZone(REPORT_ZONE);
    private static final DateTimeFormatter LOCAL_DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy", PT_BR);

    @Override
    public byte[] generate(ClinicalEvaluationPdfData data) {
        String html = buildHtml(data);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(html, null);
            builder.toStream(outputStream);
            builder.run();
            return outputStream.toByteArray();
        } catch (Exception exception) {
            throw new ReportStorageException("Unable to generate PDF report", exception);
        }
    }

    private String buildHtml(ClinicalEvaluationPdfData data) {
        return """
                <html lang="pt-BR">
                  <head>
                    <meta charset="UTF-8" />
                    <style>
                      @page { size: A4; margin: 24mm 16mm 20mm 16mm; }
                      body { font-family: Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.45; }
                      h1, h2, h3, p { margin: 0; }
                      .page-header { border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; }
                      .eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #0f766e; }
                      .section { margin-top: 18px; }
                      .section-keep { margin-top: 18px; page-break-inside: avoid; }
                      .section-title { font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 8px; page-break-after: avoid; }
                      .meta-grid { width: 100%%; border-collapse: collapse; }
                      .meta-grid td { width: 50%%; vertical-align: top; padding: 6px 0; }
                      .label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 2px; }
                      .value { color: #111827; }
                      .panel { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; background: #f8fafc; page-break-inside: avoid; }
                      .answer-table { width: 100%%; border-collapse: collapse; margin-top: 10px; }
                      .answer-table th, .answer-table td { border-bottom: 1px solid #e5e7eb; padding: 8px 6px; text-align: left; vertical-align: top; }
                      .answer-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #475569; }
                      .photo-block { page-break-inside: avoid; margin-top: 10px; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; background: #ffffff; }
                      .photo-block img { display: block; width: 100%%; max-height: 170px; margin-bottom: 8px; border-radius: 4px; }
                      .muted { color: #64748b; }
                    </style>
                  </head>
                  <body>
                    <div class="page-header">
                      <p class="eyebrow">%s</p>
                      <h1 style="margin-top: 6px; font-size: 24px;">%s</h1>
                      <p style="margin-top: 8px;" class="muted">Gerado em %s</p>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Identificação do paciente</h2>
                      <table class="meta-grid">
                        <tr>
                          <td><span class="label">Paciente</span><span class="value">%s</span></td>
                          <td><span class="label">ID do paciente</span><span class="value">%s</span></td>
                        </tr>
                        <tr>
                          <td><span class="label">E-mail</span><span class="value">%s</span></td>
                          <td><span class="label">Telefone</span><span class="value">%s</span></td>
                        </tr>
                        <tr>
                          <td><span class="label">Data de nascimento</span><span class="value">%s</span></td>
                          <td><span class="label">Gênero</span><span class="value">%s</span></td>
                        </tr>
                      </table>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Resumo clínico e observações</h2>
                      <div class="panel">
                        <p>%s</p>
                      </div>
                      <div class="panel" style="margin-top: 10px;">
                        <span class="label">Observações do prontuário</span>
                        <p>%s</p>
                      </div>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Resumo da anamnese</h2>
                      <div class="panel">
                        <p><strong>Modelo:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Registrada em:</strong> %s</p>
                      </div>
                      %s
                    </div>
                    <div class="section-keep">
                      <h2 class="section-title">Resumo da pontuação</h2>
                      <div class="panel">
                        <p><strong>Tipo:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Pontuação total:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Classificação:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Calculada em:</strong> %s</p>
                        <p style="margin-top: 8px;"><strong>Interpretação:</strong> %s</p>
                      </div>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Fotos selecionadas do paciente</h2>
                      %s
                    </div>
                  </body>
                </html>
                """.formatted(
                escapeHtml(formatClinicTitle(data.clinicTitle())),
                escapeHtml(data.reportTitle()),
                formatInstant(data.generatedAt()),
                escapeHtml(data.patientName()),
                escapeHtml(data.patientId().toString()),
                escapeHtml(defaultText(data.patientEmail())),
                escapeHtml(defaultText(data.patientPhone())),
                escapeHtml(formatLocalDate(data.patientBirthDate())),
                escapeHtml(formatGender(data.patientGender())),
                formatParagraph(data.clinicianSummary(), "Nenhum resumo clínico foi adicionado a este relatório."),
                formatParagraph(data.patientNotes(), "Nenhuma observação clínica cadastrada para o paciente."),
                escapeHtml(defaultText(data.anamnesisTemplateName())),
                escapeHtml(formatInstant(data.anamnesisCreatedAt())),
                buildAnswersTable(data.anamnesisAnswers()),
                escapeHtml(formatScoreType(data.scoreType())),
                escapeHtml(data.scoreValue() != null ? String.format(PT_BR, "%.2f", data.scoreValue()) : "-"),
                escapeHtml(formatClassification(data.scoreClassification())),
                escapeHtml(formatInstant(data.scoreCalculatedAt())),
                formatParagraph(formatInterpretation(data.scoreInterpretation()), "Nenhuma interpretação de pontuação foi registrada."),
                buildPhotoBlocks(data.photos())
        );
    }

    private String buildAnswersTable(List<ClinicalEvaluationPdfAnswerData> answers) {
        if (answers == null || answers.isEmpty()) {
            return "<div class=\"panel\" style=\"margin-top: 10px;\"><p>Nenhum registro de anamnese foi selecionado para este relatório.</p></div>";
        }

        StringBuilder builder = new StringBuilder();
        builder.append("<table class=\"answer-table\"><thead><tr><th>Pergunta</th><th>Resposta</th></tr></thead><tbody>");

        for (ClinicalEvaluationPdfAnswerData answer : answers) {
            builder.append("<tr><td>")
                    .append(escapeHtml(answer.questionLabel()))
                    .append("</td><td>")
                    .append(formatParagraph(answer.answerValue(), "-"))
                    .append("</td></tr>");
        }

        builder.append("</tbody></table>");
        return builder.toString();
    }

    private String buildPhotoBlocks(List<ClinicalEvaluationPdfPhotoData> photos) {
        if (photos == null || photos.isEmpty()) {
            return "<div class=\"panel\"><p>Nenhuma foto do paciente foi selecionada para este relatório.</p></div>";
        }

        StringBuilder builder = new StringBuilder();

        for (ClinicalEvaluationPdfPhotoData photo : photos) {
            builder.append("<div class=\"photo-block\">")
                    .append("<img alt=\"")
                    .append(escapeHtml(photo.originalFileName()))
                    .append("\" src=\"data:")
                    .append(escapeHtml(photo.contentType()))
                    .append(";base64,")
                    .append(photo.base64Content())
                    .append("\" />")
                    .append("<p><strong>Arquivo:</strong> ")
                    .append(escapeHtml(photo.originalFileName()))
                    .append("</p>")
                    .append("<p style=\"margin-top: 4px;\"><strong>Categoria:</strong> ")
                    .append(escapeHtml(formatPhotoCategory(photo.category())))
                    .append("</p>")
                    .append("<p style=\"margin-top: 4px;\"><strong>Data da captura:</strong> ")
                    .append(escapeHtml(formatLocalDate(photo.captureDate())))
                    .append("</p>")
                    .append("<p style=\"margin-top: 8px;\"><strong>Observações:</strong> ")
                    .append(formatParagraph(photo.notes(), "Nenhuma observação registrada para a foto."))
                    .append("</p>")
                    .append("</div>");
        }

        return builder.toString();
    }

    private String formatInstant(Instant instant) {
        return instant == null ? "-" : DATE_TIME_FORMATTER.format(instant);
    }

    private String formatLocalDate(LocalDate date) {
        return date == null ? "-" : LOCAL_DATE_FORMATTER.format(date);
    }

    private String formatClinicTitle(String title) {
        if (title == null || title.isBlank()) {
            return "PhaifferTech • Clínica de Tricologia";
        }
        if ("Phaiffer Tech Trichology Clinic".equalsIgnoreCase(title.trim())) {
            return "PhaifferTech • Clínica de Tricologia";
        }
        return title;
    }

    private String formatGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return "-";
        }
        return switch (gender.trim().toUpperCase(Locale.ROOT)) {
            case "FEMALE", "F", "FEMININO" -> "Feminino";
            case "MALE", "M", "MASCULINO" -> "Masculino";
            case "NON_BINARY", "NAO_BINARIO", "NÃO BINÁRIO" -> "Não binário";
            case "OTHER", "OUTRO" -> "Outro";
            case "PREFER_NOT_TO_SAY", "PREFIRO_NAO_INFORMAR" -> "Prefiro não informar";
            default -> gender;
        };
    }

    private String formatClassification(String classification) {
        if (classification == null || classification.isBlank()) {
            return "-";
        }
        return switch (classification.trim().toUpperCase(Locale.ROOT)) {
            case "LOW" -> "Baixo";
            case "MODERATE" -> "Moderado";
            case "HIGH" -> "Alto";
            case "UNCLASSIFIED" -> "Sem classificação";
            default -> classification;
        };
    }

    private String formatScoreType(String scoreType) {
        if (scoreType == null || scoreType.isBlank()) {
            return "-";
        }
        if (scoreType.endsWith(" score")) {
            return "Pontuação — " + scoreType.substring(0, scoreType.length() - 6);
        }
        return scoreType;
    }

    private String formatInterpretation(String interpretation) {
        if (interpretation == null || interpretation.isBlank()) {
            return null;
        }
        String formatted = interpretation
                .replace("Calculated from ", "Calculada a partir de ")
                .replace(" scored answers in template ", " respostas pontuadas no modelo ")
                .replace("Highest contribution: ", "Maior contribuição: ")
                .replace("No contributing question details were stored.", "Nenhum detalhe de pergunta contribuinte foi armazenado.")
                .replace("Classification: LOW.", "Classificação: Baixo.")
                .replace("Classification: MODERATE.", "Classificação: Moderado.")
                .replace("Classification: HIGH.", "Classificação: Alto.");
        return formatted.replaceAll("(\\d+)\\.(\\d{2})", "$1,$2");
    }

    private String formatPhotoCategory(String category) {
        if (category == null || category.isBlank()) {
            return "-";
        }
        return switch (category.trim().toUpperCase(Locale.ROOT)) {
            case "BEFORE" -> "Antes";
            case "AFTER" -> "Depois";
            case "PROGRESS" -> "Evolução";
            default -> category;
        };
    }

    private String defaultText(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }

    private String formatParagraph(String value, String fallback) {
        String text = value == null || value.isBlank() ? fallback : value.strip();
        return escapeHtml(text).replace("\n", "<br />");
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
