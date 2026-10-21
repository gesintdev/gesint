package br.com.gesint.modules.ctb.payroll.service;

import java.util.UUID;

import br.com.gesint.modules.ctb.payroll.dto.PayrollRunProcessResponseDto;

public interface IPayrollRunProcessingService {

    PayrollRunProcessResponseDto process(UUID payrollRunId);
}
