package com.phaiffer.clinic.modules.report.infrastructure.pdf;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.phaiffer.clinic.shared.exception.report.ReportStorageException;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class OpenHtmlClinicalEvaluationPdfGenerator implements ClinicalEvaluationPdfGenerator {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMM dd, yyyy").withZone(ZoneId.of("UTC"));

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
                <html>
                  <head>
                    <meta charset="UTF-8" />
                    <style>
                      @page { size: A4; margin: 24mm 16mm 20mm 16mm; }
                      body { font-family: Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.45; }
                      h1, h2, h3, p { margin: 0; }
                      .page-header { border-bottom: 2px solid #0f766e; padding-bottom: 14px; margin-bottom: 18px; }
                      .eyebrow { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #0f766e; }
                      .section { margin-top: 18px; }
                      .section-title { font-size: 16px; font-weight: bold; color: #111827; margin-bottom: 8px; }
                      .meta-grid { width: 100%%; border-collapse: collapse; }
                      .meta-grid td { width: 50%%; vertical-align: top; padding: 6px 0; }
                      .label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 2px; }
                      .value { color: #111827; }
                      .panel { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; background: #f8fafc; }
                      .answer-table { width: 100%%; border-collapse: collapse; margin-top: 10px; }
                      .answer-table th, .answer-table td { border-bottom: 1px solid #e5e7eb; padding: 8px 6px; text-align: left; vertical-align: top; }
                      .answer-table th { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #475569; }
                      .photo-block { page-break-inside: avoid; margin-top: 12px; border: 1px solid #d1d5db; border-radius: 8px; padding: 10px; }
                      .photo-block img { width: 100%%; max-height: 280px; object-fit: contain; margin-bottom: 8px; }
                      .muted { color: #64748b; }
                    </style>
                  </head>
                  <body>
                    <div class="page-header">
                      <p class="eyebrow">%s</p>
                      <h1 style="margin-top: 6px; font-size: 24px;">%s</h1>
                      <p style="margin-top: 8px;" class="muted">Generated on %s</p>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Patient identification</h2>
                      <table class="meta-grid">
                        <tr>
                          <td><span class="label">Patient</span><span class="value">%s</span></td>
                          <td><span class="label">Patient ID</span><span class="value">%s</span></td>
                        </tr>
                        <tr>
                          <td><span class="label">Email</span><span class="value">%s</span></td>
                          <td><span class="label">Phone</span><span class="value">%s</span></td>
                        </tr>
                        <tr>
                          <td><span class="label">Birth date</span><span class="value">%s</span></td>
                          <td><span class="label">Gender</span><span class="value">%s</span></td>
                        </tr>
                      </table>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Clinical summary and observations</h2>
                      <div class="panel">
                        <p>%s</p>
                      </div>
                      <div class="panel" style="margin-top: 10px;">
                        <span class="label">Patient notes</span>
                        <p>%s</p>
                      </div>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Anamnesis summary</h2>
                      <div class="panel">
                        <p><strong>Template:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Recorded at:</strong> %s</p>
                      </div>
                      %s
                    </div>
                    <div class="section">
                      <h2 class="section-title">Scoring summary</h2>
                      <div class="panel">
                        <p><strong>Type:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Value:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Classification:</strong> %s</p>
                        <p style="margin-top: 4px;"><strong>Calculated at:</strong> %s</p>
                        <p style="margin-top: 8px;"><strong>Interpretation:</strong> %s</p>
                      </div>
                    </div>
                    <div class="section">
                      <h2 class="section-title">Selected patient photos</h2>
                      %s
                    </div>
                  </body>
                </html>
                """.formatted(
                escapeHtml(data.clinicTitle()),
                escapeHtml(data.reportTitle()),
                formatInstant(data.generatedAt()),
                escapeHtml(data.patientName()),
                escapeHtml(data.patientId().toString()),
                escapeHtml(defaultText(data.patientEmail())),
                escapeHtml(defaultText(data.patientPhone())),
                escapeHtml(data.patientBirthDate() != null ? data.patientBirthDate().toString() : "-"),
                escapeHtml(defaultText(data.patientGender())),
                formatParagraph(data.clinicianSummary(), "No clinician summary was added for this report."),
                formatParagraph(data.patientNotes(), "No patient notes were registered."),
                escapeHtml(defaultText(data.anamnesisTemplateName())),
                escapeHtml(formatInstant(data.anamnesisCreatedAt())),
                buildAnswersTable(data.anamnesisAnswers()),
                escapeHtml(defaultText(data.scoreType())),
                escapeHtml(data.scoreValue() != null ? String.format("%.2f", data.scoreValue()) : "-"),
                escapeHtml(defaultText(data.scoreClassification())),
                escapeHtml(formatInstant(data.scoreCalculatedAt())),
                formatParagraph(data.scoreInterpretation(), "No score interpretation was registered."),
                buildPhotoBlocks(data.photos())
        );
    }

    private String buildAnswersTable(List<ClinicalEvaluationPdfAnswerData> answers) {
        if (answers == null || answers.isEmpty()) {
            return "<div class=\"panel\" style=\"margin-top: 10px;\"><p>No anamnesis record was selected for this report.</p></div>";
        }

        StringBuilder builder = new StringBuilder();
        builder.append("<table class=\"answer-table\"><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>");

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
            return "<div class=\"panel\"><p>No patient photos were selected for this report.</p></div>";
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
                    .append("<p><strong>File:</strong> ")
                    .append(escapeHtml(photo.originalFileName()))
                    .append("</p>")
                    .append("<p style=\"margin-top: 4px;\"><strong>Category:</strong> ")
                    .append(escapeHtml(photo.category()))
                    .append("</p>")
                    .append("<p style=\"margin-top: 4px;\"><strong>Capture date:</strong> ")
                    .append(escapeHtml(photo.captureDate() != null ? photo.captureDate().toString() : "-"))
                    .append("</p>")
                    .append("<p style=\"margin-top: 8px;\"><strong>Notes:</strong> ")
                    .append(formatParagraph(photo.notes(), "No photo notes were registered."))
                    .append("</p>")
                    .append("</div>");
        }

        return builder.toString();
    }

    private String formatInstant(Instant instant) {
        return instant == null ? "-" : DATE_FORMATTER.format(instant);
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
