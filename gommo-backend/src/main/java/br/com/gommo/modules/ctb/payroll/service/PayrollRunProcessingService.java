package br.com.gommo.modules.ctb.payroll.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.ctb.payroll.calculation.CalculatedPayrollLine;
import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;
import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationOrchestrator;
import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationResult;
import br.com.gommo.modules.ctb.payroll.dto.PayrollRunProcessResponseDto;
import br.com.gommo.modules.ctb.payroll.entity.PayrollRun;
import br.com.gommo.modules.ctb.payroll.entity.PayrollStatusEnum;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.ctb.payroll.event.repository.PayrollEventRepository;
import br.com.gommo.modules.ctb.payroll.exception.PayrollRunException;
import br.com.gommo.modules.ctb.payroll.integration.AttendanceHoursProvider;
import br.com.gommo.modules.ctb.payroll.integration.AttendanceHoursSnapshot;
import br.com.gommo.modules.ctb.payroll.integration.ContractSalaryProvider;
import br.com.gommo.modules.ctb.payroll.integration.ContractSalarySnapshot;
import br.com.gommo.modules.ctb.payroll.integration.LeaveDataProvider;
import br.com.gommo.modules.ctb.payroll.integration.LeaveDataSnapshot;
import br.com.gommo.modules.ctb.payroll.lifecycle.PayrollRunStateMachine;
import br.com.gommo.modules.ctb.payroll.payslip.entity.Payslip;
import br.com.gommo.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;
import br.com.gommo.modules.ctb.payroll.payslip.entry.repository.PayslipEntryRepository;
import br.com.gommo.modules.ctb.payroll.payslip.repository.PayslipRepository;
import br.com.gommo.modules.ctb.payroll.repository.PayrollRunRepository;

@Service
public class PayrollRunProcessingService implements IPayrollRunProcessingService {

    private final PayrollRunRepository payrollRunRepository;
    private final PayrollEventRepository payrollEventRepository;
    private final PayslipRepository payslipRepository;
    private final PayslipEntryRepository payslipEntryRepository;
    private final ContractSalaryProvider contractSalaryProvider;
    private final AttendanceHoursProvider attendanceHoursProvider;
    private final LeaveDataProvider leaveDataProvider;
    private final PayrollCalculationOrchestrator orchestrator;

    public PayrollRunProcessingService(
            PayrollRunRepository payrollRunRepository,
            PayrollEventRepository payrollEventRepository,
            PayslipRepository payslipRepository,
            PayslipEntryRepository payslipEntryRepository,
            ContractSalaryProvider contractSalaryProvider,
            AttendanceHoursProvider attendanceHoursProvider,
            LeaveDataProvider leaveDataProvider,
            PayrollCalculationOrchestrator orchestrator) {
        this.payrollRunRepository = payrollRunRepository;
        this.payrollEventRepository = payrollEventRepository;
        this.payslipRepository = payslipRepository;
        this.payslipEntryRepository = payslipEntryRepository;
        this.contractSalaryProvider = contractSalaryProvider;
        this.attendanceHoursProvider = attendanceHoursProvider;
        this.leaveDataProvider = leaveDataProvider;
        this.orchestrator = orchestrator;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('payroll:write')")
    public PayrollRunProcessResponseDto process(UUID payrollRunId) {
        PayrollRun payrollRun = payrollRunRepository
                .findByIdAndStatusNot(payrollRunId, StatusEnum.DELETED)
                .orElseThrow(PayrollRunException::notFound);

        validateProcessable(payrollRun);

        Map<String, PayrollEvent> eventsByCode = loadEventsByCode();
        if (eventsByCode.isEmpty()) {
            throw PayrollRunException.noEventsConfigured();
        }

        payrollRun.setPayrollStatus(PayrollStatusEnum.PROCESSING);
        payrollRunRepository.save(payrollRun);

        YearMonth competence = YearMonth.from(payrollRun.getReferenceDate());
        LocalDate periodStart = competence.atDay(1);
        LocalDate periodEnd = competence.atEndOfMonth();

        List<ContractSalarySnapshot> contracts =
                contractSalaryProvider.findActiveContracts(null, periodStart, periodEnd);

        int processed = 0;
        for (ContractSalarySnapshot contract : contracts) {
            PayrollCalculationContext context =
                    buildContext(payrollRun, contract, periodStart, periodEnd, eventsByCode);
            PayrollCalculationResult result = orchestrator.calculate(context);
            persistPayslip(payrollRun.getId(), result);
            processed++;
        }

        OffsetDateTime processedAt = OffsetDateTime.now();
        payrollRun.setPayrollStatus(PayrollStatusEnum.PROCESSED);
        payrollRun.setProcessedAt(processedAt);
        payrollRunRepository.save(payrollRun);

        return PayrollRunProcessResponseDto.builder()
                .payrollRunId(payrollRun.getId())
                .payrollStatus(payrollRun.getPayrollStatus())
                .payslipsProcessed(processed)
                .processedAt(processedAt)
                .build();
    }

    private static void validateProcessable(PayrollRun payrollRun) {
        PayrollRunStateMachine.assertCanProcess(payrollRun.getPayrollStatus());
    }

    private Map<String, PayrollEvent> loadEventsByCode() {
        Map<String, PayrollEvent> eventsByCode = new HashMap<>();
        for (PayrollEvent event : payrollEventRepository.findAllByStatusNotOrderByCreatedAtDesc(StatusEnum.DELETED)) {
            eventsByCode.putIfAbsent(event.getEventCode(), event);
        }
        return eventsByCode;
    }

    private PayrollCalculationContext buildContext(
            PayrollRun payrollRun,
            ContractSalarySnapshot contract,
            LocalDate periodStart,
            LocalDate periodEnd,
            Map<String, PayrollEvent> eventsByCode) {
        AttendanceHoursSnapshot attendance =
                attendanceHoursProvider.loadHours(contract.collaboratorId(), periodStart, periodEnd);
        LeaveDataSnapshot leave = leaveDataProvider.loadLeaveData(contract.collaboratorId(), periodStart, periodEnd);

        PayrollCalculationContext context = new PayrollCalculationContext(
                payrollRun.getId(),
                contract.collaboratorId(),
                contract.companyId(),
                payrollRun.getReferenceDate(),
                periodStart,
                periodEnd,
                eventsByCode);

        context.setBaseSalary(contract.baseSalary());
        context.setWeeklyWorkloadHours(contract.weeklyWorkloadHours());
        context.setWorkedHours(attendance.workedHours());
        context.setNightShiftHours(attendance.nightShiftHours());
        context.setUnpaidLeaveDays(leave.unpaidLeaveDays());
        return context;
    }

    private void persistPayslip(UUID payrollRunId, PayrollCalculationResult result) {
        Payslip payslip = payslipRepository
                .findByPayrollRunIdAndCollaboratorIdAndStatusNot(
                        payrollRunId, result.collaboratorId(), StatusEnum.DELETED)
                .orElseGet(() -> Payslip.builder()
                        .payrollRunId(payrollRunId)
                        .collaboratorId(result.collaboratorId())
                        .status(StatusEnum.ACTIVE)
                        .build());

        payslip.setBaseSalary(result.baseSalary());
        payslip.setGrossAmount(result.grossAmount());
        payslip.setDeductionsAmount(result.deductionsAmount());
        payslip.setNetAmount(result.netAmount());
        payslip.setGeneratedAt(OffsetDateTime.now());
        payslipRepository.save(payslip);

        softDeleteEntries(payslip.getId());
        for (CalculatedPayrollLine line : result.lines()) {
            PayslipEntry entry = PayslipEntry.builder()
                    .payslipId(payslip.getId())
                    .payrollEventId(line.payrollEventId())
                    .quantity(line.quantity())
                    .unitValue(line.unitValue())
                    .totalValue(line.totalValue())
                    .status(StatusEnum.ACTIVE)
                    .build();
            payslipEntryRepository.save(entry);
        }
    }

    private void softDeleteEntries(UUID payslipId) {
        for (PayslipEntry entry :
                payslipEntryRepository.findAllByPayslipIdAndStatusNot(payslipId, StatusEnum.DELETED)) {
            entry.setStatus(StatusEnum.DELETED);
            payslipEntryRepository.save(entry);
        }
    }
}
