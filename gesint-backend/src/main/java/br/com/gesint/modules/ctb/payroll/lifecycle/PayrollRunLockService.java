package br.com.gesint.modules.ctb.payroll.lifecycle;

import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.entity.PayrollRun;
import br.com.gesint.modules.ctb.payroll.exception.PayrollRunException;
import br.com.gesint.modules.ctb.payroll.repository.PayrollRunRepository;

@Component
public class PayrollRunLockService {

    private final PayrollRunRepository payrollRunRepository;

    public PayrollRunLockService(PayrollRunRepository payrollRunRepository) {
        this.payrollRunRepository = payrollRunRepository;
    }

    public PayrollRun requireExisting(UUID payrollRunId) {
        return payrollRunRepository
                .findByIdAndStatusNot(payrollRunId, StatusEnum.DELETED)
                .orElseThrow(PayrollRunException::notFound);
    }

    public PayrollRun requireWritable(UUID payrollRunId) {
        PayrollRun payrollRun = requireExisting(payrollRunId);
        PayrollRunStateMachine.assertWritable(payrollRun.getPayrollStatus());
        return payrollRun;
    }
}
