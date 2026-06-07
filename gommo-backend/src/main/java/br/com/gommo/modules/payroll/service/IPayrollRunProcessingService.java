package br.com.gommo.modules.payroll.service;

import br.com.gommo.modules.payroll.dto.PayrollRunProcessResponseDto;
import java.util.UUID;

public interface IPayrollRunProcessingService {

    PayrollRunProcessResponseDto process(UUID payrollRunId);
}
