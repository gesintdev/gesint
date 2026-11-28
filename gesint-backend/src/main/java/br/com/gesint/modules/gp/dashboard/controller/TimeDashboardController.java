package br.com.gesint.modules.gp.dashboard.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.gp.dashboard.dto.TimeDashboardResponseDto;
import br.com.gesint.modules.gp.dashboard.service.ITimeDashboardService;

@RestController
@RequestMapping("/api/v1/time-management/dashboard")
public class TimeDashboardController {

    private final ITimeDashboardService service;

    public TimeDashboardController(ITimeDashboardService service) {
        this.service = service;
    }

    @GetMapping
    public TimeDashboardResponseDto dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.dashboard(from, to);
    }
}
