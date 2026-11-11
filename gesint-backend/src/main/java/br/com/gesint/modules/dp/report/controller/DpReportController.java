package br.com.gesint.modules.dp.report.controller;

import java.nio.charset.StandardCharsets;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.core.report.GeneratedReport;
import br.com.gesint.modules.dp.report.service.IDpReportService;

@RestController
@RequestMapping("/api/v1/reports/dp")
public class DpReportController {

    private final IDpReportService reportService;

    public DpReportController(IDpReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping(value = "/employees", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> employeeRoster() {
        return pdf(reportService.generateEmployeeRoster());
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
