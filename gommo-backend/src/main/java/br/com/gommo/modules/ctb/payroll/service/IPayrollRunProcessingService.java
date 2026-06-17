package br.com.gommo.modules.ctb.payroll.service;

import br.com.gommo.modules.ctb.payroll.dto.PayrollRunProcessResponseDto;
import java.util.UUID;

public interface IPayrollRunProcessingService {

    PayrollRunProcessResponseDto process(UUID payrollRunId);
}
