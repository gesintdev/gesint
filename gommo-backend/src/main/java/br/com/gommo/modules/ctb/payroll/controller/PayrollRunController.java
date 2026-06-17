package br.com.gommo.modules.ctb.payroll.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.ctb.payroll.dto.PayrollRunProcessResponseDto;
import br.com.gommo.modules.ctb.payroll.dto.PayrollRunRequestDto;
import br.com.gommo.modules.ctb.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.ctb.payroll.service.IPayrollRunLifecycleService;
import br.com.gommo.modules.ctb.payroll.service.IPayrollRunProcessingService;
import br.com.gommo.modules.ctb.payroll.service.IPayrollRunService;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payroll-runs")
public class PayrollRunController extends BaseController<PayrollRunRequestDto, PayrollRunResponseDto> {

    private final IPayrollRunProcessingService processingService;
    private final IPayrollRunLifecycleService lifecycleService;

    public PayrollRunController(
            IPayrollRunService service,
            IPayrollRunProcessingService processingService,
            IPayrollRunLifecycleService lifecycleService) {
        super(service);
        this.processingService = processingService;
        this.lifecycleService = lifecycleService;
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<PayrollRunProcessResponseDto> process(@PathVariable UUID id) {
        return ResponseEntity.ok(processingService.process(id));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<PayrollRunResponseDto> review(@PathVariable UUID id) {
        return ResponseEntity.ok(lifecycleService.review(id));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<PayrollRunResponseDto> close(@PathVariable UUID id) {
        return ResponseEntity.ok(lifecycleService.close(id));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<PayrollRunResponseDto> reopen(@PathVariable UUID id) {
        return ResponseEntity.ok(lifecycleService.reopen(id));
    }
}
