package br.com.gesint.modules.ctb.payroll.event.service;

import br.com.gesint.core.base.service.IBaseService;
import br.com.gesint.modules.ctb.payroll.event.dto.PayrollEventRequestDto;
import br.com.gesint.modules.ctb.payroll.event.dto.PayrollEventResponseDto;

public interface IPayrollEventService extends IBaseService<PayrollEventRequestDto, PayrollEventResponseDto> {}
