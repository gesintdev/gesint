package br.com.gommo.modules.payroll.service;

import br.com.gommo.modules.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.payroll.entity.PayrollRun;
import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import br.com.gommo.modules.payroll.lifecycle.PayrollRunLockService;
import br.com.gommo.modules.payroll.lifecycle.PayrollRunStateMachine;
import br.com.gommo.modules.payroll.mapper.PayrollRunMapper;
import br.com.gommo.modules.payroll.repository.PayrollRunRepository;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PayrollRunLifecycleService implements IPayrollRunLifecycleService {

    private final PayrollRunRepository payrollRunRepository;
    private final PayrollRunLockService payrollRunLockService;
    private final PayrollRunMapper mapper;

    public PayrollRunLifecycleService(
            PayrollRunRepository payrollRunRepository,
            PayrollRunLockService payrollRunLockService,
            PayrollRunMapper mapper) {
        this.payrollRunRepository = payrollRunRepository;
        this.payrollRunLockService = payrollRunLockService;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto review(UUID payrollRunId) {
        PayrollRun payrollRun = payrollRunLockService.requireExisting(payrollRunId);
        PayrollRunStateMachine.assertCanReview(payrollRun.getPayrollStatus());
        payrollRun.setPayrollStatus(PayrollStatusEnum.REVIEWED);
        return mapper.toResponse(payrollRunRepository.save(payrollRun));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto close(UUID payrollRunId) {
        PayrollRun payrollRun = payrollRunLockService.requireExisting(payrollRunId);
        PayrollRunStateMachine.assertCanClose(payrollRun.getPayrollStatus());
        payrollRun.setPayrollStatus(PayrollStatusEnum.CLOSED);
        payrollRun.setClosedAt(OffsetDateTime.now());
        return mapper.toResponse(payrollRunRepository.save(payrollRun));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunResponseDto reopen(UUID payrollRunId) {
        PayrollRun payrollRun = payrollRunLockService.requireExisting(payrollRunId);
        PayrollRunStateMachine.assertCanReopen(payrollRun.getPayrollStatus());
        payrollRun.setPayrollStatus(PayrollStatusEnum.OPEN);
        payrollRun.setClosedAt(null);
        if (payrollRun.getOpenedAt() == null) {
            payrollRun.setOpenedAt(OffsetDateTime.now());
        }
        return mapper.toResponse(payrollRunRepository.save(payrollRun));
    }
}
