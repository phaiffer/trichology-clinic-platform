package com.phaiffer.clinic.modules.report.presentation;

import com.phaiffer.clinic.modules.report.application.dto.CreateReportRequest;
import com.phaiffer.clinic.modules.report.application.dto.ReportListItemResponse;
import com.phaiffer.clinic.modules.report.application.dto.ReportResponse;
import com.phaiffer.clinic.modules.report.application.usecase.ReportService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{patientId}/reports")
public class PatientReportController {

    private final ReportService reportService;

    public PatientReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse createReport(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateReportRequest request
    ) {
        return reportService.createReport(patientId, request);
    }

    @GetMapping
    public List<ReportListItemResponse> listReports(@PathVariable UUID patientId) {
        return reportService.listReports(patientId);
    }

    @GetMapping("/{reportId}")
    public ReportResponse getReport(
            @PathVariable UUID patientId,
            @PathVariable UUID reportId
    ) {
        return reportService.getReport(patientId, reportId);
    }

    @GetMapping("/{reportId}/file")
    public ResponseEntity<Resource> getReportFile(
            @PathVariable UUID patientId,
            @PathVariable UUID reportId
    ) {
        ReportResponse report = reportService.getReport(patientId, reportId);
        Resource resource = reportService.getReportFile(patientId, reportId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(report.fileName()).build().toString()
                )
                .body(resource);
    }

    @DeleteMapping("/{reportId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReport(
            @PathVariable UUID patientId,
            @PathVariable UUID reportId
    ) {
        reportService.deleteReport(patientId, reportId);
    }
}
