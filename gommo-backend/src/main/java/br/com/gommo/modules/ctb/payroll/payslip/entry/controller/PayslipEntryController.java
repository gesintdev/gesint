package br.com.gommo.modules.ctb.payroll.payslip.entry.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryRequestDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.dto.PayslipEntryResponseDto;
import br.com.gommo.modules.ctb.payroll.payslip.entry.service.IPayslipEntryService;

@RestController
@RequestMapping("/api/v1/payslip-entries")
public class PayslipEntryController extends BaseController<PayslipEntryRequestDto, PayslipEntryResponseDto> {

    public PayslipEntryController(IPayslipEntryService service) {
        super(service);
    }
}
