package br.com.gesint.modules.rh.report.controller;

import java.nio.charset.StandardCharsets;

import jakarta.validation.Valid;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.report.GeneratedReport;
import br.com.gesint.modules.rh.report.dto.PeriodReportFilterDto;
import br.com.gesint.modules.rh.report.service.IRhReportService;

@RestController
@RequestMapping("/api/v1/reports/rh")
public class RhReportController {

    private final IRhReportService reportService;

    public RhReportController(IRhReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping(value = "/admissions", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> admissions(@Valid @ModelAttribute PeriodReportFilterDto filter) {
        return pdf(reportService.generateAdmissions(filter));
    }

    @GetMapping(value = "/leaves", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> leaves(@Valid @ModelAttribute PeriodReportFilterDto filter) {
        return pdf(reportService.generateLeaves(filter));
    }

    private ResponseEntity<byte[]> pdf(GeneratedReport report) {
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(report.filename(), StandardCharsets.UTF_8)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(report.content().length)
                .body(report.content());
    }
}
