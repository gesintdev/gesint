package br.com.gommo.modules.payroll.payslip.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.payslip.dto.PayslipRequestDto;
import br.com.gommo.modules.payroll.payslip.dto.PayslipResponseDto;
import br.com.gommo.modules.payroll.payslip.service.IPayslipService;

@RestController
@RequestMapping("/api/v1/payslips")
public class PayslipController extends BaseController<PayslipRequestDto, PayslipResponseDto> {
    public PayslipController(IPayslipService service) {
        super(service);
    }
}
