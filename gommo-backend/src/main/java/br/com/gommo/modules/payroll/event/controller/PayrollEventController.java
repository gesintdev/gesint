package br.com.gommo.modules.payroll.event.controller;

import br.com.gommo.core.base.controller.BaseController;
import br.com.gommo.modules.payroll.event.dto.PayrollEventRequestDto;
import br.com.gommo.modules.payroll.event.dto.PayrollEventResponseDto;
import br.com.gommo.modules.payroll.event.service.IPayrollEventService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payroll-events")
public class PayrollEventController extends BaseController<PayrollEventRequestDto, PayrollEventResponseDto> {

    public PayrollEventController(IPayrollEventService service) {
        super(service);
    }
}
