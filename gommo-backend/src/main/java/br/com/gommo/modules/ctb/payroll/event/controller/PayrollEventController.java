package br.com.gommo.modules.ctb.payroll.event.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventRequestDto;
import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventResponseDto;
import br.com.gommo.modules.ctb.payroll.event.service.IPayrollEventService;

@RestController
@RequestMapping("/api/v1/payroll-events")
public class PayrollEventController extends BaseController<PayrollEventRequestDto, PayrollEventResponseDto> {

    public PayrollEventController(IPayrollEventService service) {
        super(service);
    }
}
