package br.com.gommo.modules.ctb.payroll.service;

import br.com.gommo.modules.ctb.payroll.dto.PayrollRunResponseDto;
import java.util.UUID;

public interface IPayrollRunLifecycleService {

    PayrollRunResponseDto review(UUID payrollRunId);

    PayrollRunResponseDto close(UUID payrollRunId);

    PayrollRunResponseDto reopen(UUID payrollRunId);
}
