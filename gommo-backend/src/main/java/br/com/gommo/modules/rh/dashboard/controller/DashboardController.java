package br.com.gommo.modules.rh.dashboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.rh.dashboard.dto.DashboardSummaryResponseDto;
import br.com.gommo.modules.rh.dashboard.service.IDashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final IDashboardService dashboardService;

    public DashboardController(IDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponseDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }
}
