package br.com.gesint.modules.ctb.payroll.service;

import java.util.UUID;

import br.com.gesint.modules.ctb.payroll.dto.PayrollRunResponseDto;

public interface IPayrollRunLifecycleService {

    PayrollRunResponseDto review(UUID payrollRunId);

    PayrollRunResponseDto close(UUID payrollRunId);

    PayrollRunResponseDto reopen(UUID payrollRunId);
}
