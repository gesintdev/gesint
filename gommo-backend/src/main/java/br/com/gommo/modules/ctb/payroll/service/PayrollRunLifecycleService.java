package br.com.gommo.modules.ctb.payroll.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.audit.trail.AuditActionEnum;
import br.com.gommo.core.audit.trail.AuditTrailEntry;
import br.com.gommo.core.audit.trail.AuditTrailRecorder;
import br.com.gommo.modules.ctb.payroll.dto.PayrollRunResponseDto;
import br.com.gommo.modules.ctb.payroll.entity.PayrollRun;
import br.com.gommo.modules.ctb.payroll.entity.PayrollStatusEnum;
import br.com.gommo.modules.ctb.payroll.lifecycle.PayrollRunLockService;
import br.com.gommo.modules.ctb.payroll.lifecycle.PayrollRunStateMachine;
import br.com.gommo.modules.ctb.payroll.mapper.PayrollRunMapper;
import br.com.gommo.modules.ctb.payroll.repository.PayrollRunRepository;

@Service
public class PayrollRunLifecycleService implements IPayrollRunLifecycleService {

    private final PayrollRunRepository payrollRunRepository;
    private final PayrollRunLockService payrollRunLockService;
    private final PayrollRunMapper mapper;
    private final AuditTrailRecorder auditTrail;

    public PayrollRunLifecycleService(
            PayrollRunRepository payrollRunRepository,
            PayrollRunLockService payrollRunLockService,
            PayrollRunMapper mapper,
            AuditTrailRecorder auditTrail) {
        this.payrollRunRepository = payrollRunRepository;
        this.payrollRunLockService = payrollRunLockService;
        this.mapper = mapper;
        this.auditTrail = auditTrail;
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
        PayrollRun saved = payrollRunRepository.save(payrollRun);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.CLOSE, saved));
        return mapper.toResponse(saved);
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
        PayrollRun saved = payrollRunRepository.save(payrollRun);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.REOPEN, saved));
        return mapper.toResponse(saved);
    }
}
