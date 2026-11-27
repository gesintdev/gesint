package br.com.gesint.modules.gp.timesheet.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.audit.CurrentAuditor;
import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.dto.AttendanceDayResponseDto;
import br.com.gesint.modules.gp.attendance.exception.AttendanceRecordException;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;
import br.com.gesint.modules.gp.timesheet.dto.TimesheetActionRequestDto;
import br.com.gesint.modules.gp.timesheet.dto.TimesheetResponseDto;
import br.com.gesint.modules.gp.timesheet.entity.AttendanceTimesheet;
import br.com.gesint.modules.gp.timesheet.entity.TimesheetClosingStatusEnum;
import br.com.gesint.modules.gp.timesheet.pdf.TimesheetPdfRenderer;
import br.com.gesint.modules.gp.timesheet.repository.AttendanceTimesheetRepository;

@Service
public class TimesheetService implements ITimesheetService {

    private final AttendanceEvaluationService evaluationService;
    private final AttendanceTimesheetRepository repository;
    private final TimesheetPdfRenderer pdfRenderer;
    private final AuditTrailRecorder auditTrail;

    public TimesheetService(
            AttendanceEvaluationService evaluationService,
            AttendanceTimesheetRepository repository,
            TimesheetPdfRenderer pdfRenderer,
            AuditTrailRecorder auditTrail) {
        this.evaluationService = evaluationService;
        this.repository = repository;
        this.pdfRenderer = pdfRenderer;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('timesheet:read')")
    public TimesheetResponseDto list(LocalDate from, LocalDate to) {
        LocalDate[] period = period(from, to);
        TimeTrackingSettings settings = evaluationService.settings();
        Map<UUID, AttendanceTimesheet> sheets = repository
                .findByPeriodStartAndPeriodEndAndStatusNot(period[0], period[1], StatusEnum.DELETED)
                .stream()
                .collect(Collectors.toMap(AttendanceTimesheet::getCollaboratorId, Function.identity(), (a, b) -> a));
        List<TimesheetResponseDto.Row> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluationService.evaluate(period[0], period[1], null, settings)) {
            AttendanceTimesheet sheet = sheets.get(evaluation.getCollaboratorId());
            rows.add(TimesheetResponseDto.Row.builder()
                    .id(evaluation.getCollaboratorId().toString())
                    .collaboratorId(evaluation.getCollaboratorId())
                    .collaboratorName(evaluation.getCollaboratorName())
                    .jobTitle(evaluation.getJobTitle())
                    .photoObjectId(evaluation.getPhotoObjectId())
                    .workScheduleName(evaluation.getWorkScheduleName())
                    .expectedMinutes(evaluation.sumExpected())
                    .workedMinutes(evaluation.sumWorked())
                    .overtimeMinutes(evaluation.sumOvertime())
                    .hourBankMinutes(evaluation.sumHourBank())
                    .pendingCount((int) evaluation.pendingDays())
                    .closingStatus(closingStatus(sheet).name())
                    .closedAt(sheet != null && closingStatus(sheet) == TimesheetClosingStatusEnum.CLOSED ? sheet.getClosedAt() : null)
                    .build());
        }
        return TimesheetResponseDto.builder()
                .periodStart(period[0])
                .periodEnd(period[1])
                .hourBankEnabled(settings.isHourBankEnabled())
                .overtimeEnabled(settings.isOvertimeEnabled())
                .rows(rows)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('timesheet:read')")
    public TimesheetResponseDto.Detail detail(UUID collaboratorId, LocalDate from, LocalDate to) {
        return buildDetail(collaboratorId, period(from, to));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('timesheet:write')")
    public TimesheetResponseDto.CloseResult close(TimesheetActionRequestDto request) {
        LocalDate[] period = period(request.getFrom(), request.getTo());
        if (!period[1].isBefore(evaluationService.today())) {
            // Periodo em andamento: ainda vai receber marcacoes, entao nao pode ser travado.
            throw AttendanceRecordException.timesheetPeriodNotEnded();
        }
        List<UUID> only = request.getCollaboratorIds() == null || request.getCollaboratorIds().isEmpty()
                ? null
                : request.getCollaboratorIds();
        List<CollaboratorPeriodEvaluation> evaluations = evaluationService.evaluate(period[0], period[1], only);
        List<String> skipped = new ArrayList<>();
        int closed = 0;
        UUID actor = CurrentAuditor.userId().orElse(null);
        for (CollaboratorPeriodEvaluation evaluation : evaluations) {
            if (evaluation.pendingDays() > 0) {
                skipped.add(evaluation.getCollaboratorName());
                continue;
            }
            AttendanceTimesheet sheet = find(evaluation.getCollaboratorId(), period).orElseGet(() -> AttendanceTimesheet.builder()
                    .collaboratorId(evaluation.getCollaboratorId())
                    .companyId(evaluation.getCompanyId())
                    .periodStart(period[0])
                    .periodEnd(period[1])
                    .status(StatusEnum.ACTIVE)
                    .build());
            if (sheet.getClosingStatus() == TimesheetClosingStatusEnum.CLOSED) {
                continue;
            }
            sheet.setClosingStatus(TimesheetClosingStatusEnum.CLOSED);
            sheet.setClosedAt(OffsetDateTime.now(AttendanceEvaluationService.BUSINESS_ZONE));
            sheet.setClosedBy(actor);
            sheet.setWorkedMinutes(evaluation.sumWorked());
            sheet.setOvertimeMinutes(evaluation.sumOvertime());
            sheet.setHourBankMinutes(evaluation.sumHourBank());
            sheet.setPendingDays(0);
            AttendanceTimesheet saved = repository.save(sheet);
            auditTrail.record(AuditTrailEntry.of(AuditActionEnum.CLOSE, saved)
                    .detail("Espelho " + period[0] + " a " + period[1]));
            closed++;
        }
        if (closed == 0 && !skipped.isEmpty() && only != null && only.size() == 1) {
            throw AttendanceRecordException.timesheetHasPending();
        }
        return TimesheetResponseDto.CloseResult.builder().closed(closed).skippedWithPending(skipped).build();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('timesheet:write')")
    public TimesheetResponseDto.Detail reopen(UUID collaboratorId, TimesheetActionRequestDto request) {
        if (request.getReason() == null || request.getReason().isBlank()) {
            throw AttendanceRecordException.timesheetReopenReasonRequired();
        }
        LocalDate[] period = period(request.getFrom(), request.getTo());
        AttendanceTimesheet sheet = find(collaboratorId, period)
                .filter(item -> item.getClosingStatus() == TimesheetClosingStatusEnum.CLOSED)
                .orElseThrow(AttendanceRecordException::timesheetNotClosed);
        sheet.setClosingStatus(TimesheetClosingStatusEnum.OPEN);
        sheet.setReopenReason(request.getReason().trim());
        AttendanceTimesheet saved = repository.save(sheet);
        auditTrail.record(AuditTrailEntry.of(AuditActionEnum.REOPEN, saved)
                .detail("Espelho " + period[0] + " a " + period[1])
                .reason(request.getReason().trim()));
        return buildDetail(collaboratorId, period);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('timesheet:export')")
    public byte[] pdf(UUID collaboratorId, LocalDate from, LocalDate to) {
        LocalDate[] period = period(from, to);
        TimesheetResponseDto.Detail detail = buildDetail(collaboratorId, period);
        byte[] pdf = pdfRenderer.render(detail, evaluationService.companyFor(collaboratorId));
        auditTrail.recordIsolated(AuditTrailEntry.of(AuditActionEnum.EXPORT, AttendanceTimesheet.class, collaboratorId)
                .detail("Espelho de ponto " + period[0] + " a " + period[1]));
        return pdf;
    }

    @Override
    public String filename(UUID collaboratorId, LocalDate from, LocalDate to) {
        LocalDate[] period = period(from, to);
        return "espelho-de-ponto-" + period[0] + "-a-" + period[1] + ".pdf";
    }

    /** Usado pelo ponto para travar alteracao em periodo fechado. */
    @Override
    @Transactional(readOnly = true)
    public boolean isClosed(UUID collaboratorId, LocalDate date) {
        if (collaboratorId == null || date == null) {
            return false;
        }
        return repository.existsClosedCovering(collaboratorId, date, TimesheetClosingStatusEnum.CLOSED, StatusEnum.DELETED);
    }

    private TimesheetResponseDto.Detail buildDetail(UUID collaboratorId, LocalDate[] period) {
        TimeTrackingSettings settings = evaluationService.settings();
        LocalDate accrualStart = settings.getHourBankStartDate();
        boolean bank = settings.isHourBankEnabled();
        LocalDate evaluationStart = bank && accrualStart.isBefore(period[0]) ? accrualStart : period[0];
        CollaboratorPeriodEvaluation full = evaluationService
                .evaluate(evaluationStart, period[1], List.of(collaboratorId), settings)
                .stream()
                .findFirst()
                .orElseThrow(AttendanceRecordException::notFound);
        int previous = 0;
        List<AttendanceDayEvaluation> days = new ArrayList<>();
        for (AttendanceDayEvaluation day : full.getDays()) {
            if (day.getDate().isBefore(period[0])) {
                if (bank && !day.getDate().isBefore(accrualStart)) {
                    previous += day.getHourBankMinutes();
                }
            } else {
                days.add(day);
            }
        }
        int periodBank = days.stream()
                .filter(day -> !bank || !day.getDate().isBefore(accrualStart))
                .mapToInt(AttendanceDayEvaluation::getHourBankMinutes)
                .sum();
        AttendanceTimesheet sheet = find(collaboratorId, period).orElse(null);
        TimesheetClosingStatusEnum status = closingStatus(sheet);
        return TimesheetResponseDto.Detail.builder()
                .collaboratorId(collaboratorId)
                .collaboratorCode(full.getCollaboratorCode())
                .collaboratorName(full.getCollaboratorName())
                .jobTitle(full.getJobTitle())
                .departmentName(full.getDepartmentName())
                .workScheduleName(full.getWorkScheduleName())
                .admissionDate(full.getAdmissionDate())
                .periodStart(period[0])
                .periodEnd(period[1])
                .closingStatus(status.name())
                .closedAt(status == TimesheetClosingStatusEnum.CLOSED ? sheet.getClosedAt() : null)
                .reopenReason(sheet != null ? sheet.getReopenReason() : null)
                .hourBankEnabled(bank)
                .overtimeEnabled(settings.isOvertimeEnabled())
                .expectedMinutes(days.stream().mapToInt(AttendanceDayEvaluation::getExpectedMinutes).sum())
                .workedMinutes(days.stream().mapToInt(AttendanceDayEvaluation::getWorkedMinutes).sum())
                .overtimeMinutes(days.stream().mapToInt(AttendanceDayEvaluation::getOvertimeMinutes).sum())
                .hourBankMinutes(periodBank)
                .debitMinutes(days.stream().mapToInt(AttendanceDayEvaluation::getDebitMinutes).sum())
                .previousBalanceMinutes(previous)
                .totalBalanceMinutes(previous + periodBank)
                .pendingCount((int) days.stream().filter(AttendanceDayEvaluation::isPending).count())
                .days(days.stream().map(AttendanceDayResponseDto::from).toList())
                .build();
    }

    private Optional<AttendanceTimesheet> find(UUID collaboratorId, LocalDate[] period) {
        return repository.findByCollaboratorIdAndPeriodStartAndPeriodEndAndStatusNot(
                collaboratorId, period[0], period[1], StatusEnum.DELETED);
    }

    private static TimesheetClosingStatusEnum closingStatus(AttendanceTimesheet sheet) {
        return sheet != null && sheet.getClosingStatus() != null ? sheet.getClosingStatus() : TimesheetClosingStatusEnum.OPEN;
    }

    private LocalDate[] period(LocalDate from, LocalDate to) {
        LocalDate today = evaluationService.today();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : today.withDayOfMonth(today.lengthOfMonth());
        return start.isAfter(end) ? new LocalDate[] {end, start} : new LocalDate[] {start, end};
    }
}
