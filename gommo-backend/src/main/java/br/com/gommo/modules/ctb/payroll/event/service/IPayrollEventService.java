package br.com.gommo.modules.ctb.payroll.event.service;

import br.com.gommo.core.base.service.IBaseService;
import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventRequestDto;
import br.com.gommo.modules.ctb.payroll.event.dto.PayrollEventResponseDto;

public interface IPayrollEventService extends IBaseService<PayrollEventRequestDto, PayrollEventResponseDto> {}
