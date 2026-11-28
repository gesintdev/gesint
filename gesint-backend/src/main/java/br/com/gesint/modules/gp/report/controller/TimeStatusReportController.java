package br.com.gesint.modules.gp.report.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.report.dto.TimeStatusMetricEnum;
import br.com.gesint.modules.gp.report.dto.TimeStatusReportResponseDto;
import br.com.gesint.modules.gp.report.service.ITimeStatusReportService;

@RestController
@RequestMapping("/api/v1/time-management/status")
public class TimeStatusReportController {

    private final ITimeStatusReportService service;

    public TimeStatusReportController(ITimeStatusReportService service) {
        this.service = service;
    }

    @GetMapping
    public TimeStatusReportResponseDto report(
            @RequestParam TimeStatusMetricEnum metric,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.report(metric, from, to);
    }
}
