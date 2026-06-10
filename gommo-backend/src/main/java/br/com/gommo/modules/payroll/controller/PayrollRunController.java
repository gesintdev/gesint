package br.com.gommo.modules.payroll.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.dto.PayrollRunRequestDto;
import br.com.gommo.modules.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.payroll.service.IPayrollRunService;

@RestController
@RequestMapping("/api/v1/payroll-runs")
public class PayrollRunController extends BaseController<PayrollRunRequestDto, PayrollRunResponseDto> {
    public PayrollRunController(IPayrollRunService service) {
        super(service);
    }
}
