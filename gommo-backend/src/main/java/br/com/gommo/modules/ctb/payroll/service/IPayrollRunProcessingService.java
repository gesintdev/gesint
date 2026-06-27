package br.com.gommo.modules.ctb.payroll.service;

import java.util.UUID;

import br.com.gommo.modules.ctb.payroll.dto.PayrollRunProcessResponseDto;

public interface IPayrollRunProcessingService {

    PayrollRunProcessResponseDto process(UUID payrollRunId);
}
