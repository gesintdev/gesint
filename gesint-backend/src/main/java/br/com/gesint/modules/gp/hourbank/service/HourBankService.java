package br.com.gesint.modules.gp.hourbank.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.exception.AttendanceRecordException;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.hourbank.dto.HourBankResponseDto;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;

/**
 * Banco de horas derivado da apuracao diaria: saldo = soma dos saldos dos dias desde o inicio
 * configurado. Nao ha lancamento editavel; ajuste se faz corrigindo o ponto.
 */
@Service
public class HourBankService implements IHourBankService {

    private final AttendanceEvaluationService evaluationService;

    public HourBankService(AttendanceEvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('hourbank:read')")
    public HourBankResponseDto balances(LocalDate from, LocalDate to) {
        TimeTrackingSettings settings = evaluationService.settings();
        LocalDate[] period = period(from, to);
        LocalDate accrualStart = settings.getHourBankStartDate();
        if (!settings.isHourBankEnabled()) {
            return HourBankResponseDto.builder()
                    .enabled(false)
                    .accrualStart(accrualStart)
                    .periodStart(period[0])
                    .periodEnd(period[1])
                    .rows(List.of())
                    .build();
        }
        LocalDate evaluationStart = accrualStart.isBefore(period[0]) ? accrualStart : period[0];
        List<HourBankResponseDto.Row> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluationService.evaluate(evaluationStart, period[1], null, settings)) {
            int previous = 0;
            int credit = 0;
            int debit = 0;
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                if (day.getDate().isBefore(accrualStart)) {
                    continue;
                }
                if (day.getDate().isBefore(period[0])) {
                    previous += day.getHourBankMinutes();
                } else if (day.getHourBankMinutes() > 0) {
                    credit += day.getHourBankMinutes();
                } else {
                    debit += -day.getHourBankMinutes();
                }
            }
            rows.add(HourBankResponseDto.Row.builder()
                    .id(evaluation.getCollaboratorId().toString())
                    .collaboratorId(evaluation.getCollaboratorId())
                    .collaboratorName(evaluation.getCollaboratorName())
                    .jobTitle(evaluation.getJobTitle())
                    .photoObjectId(evaluation.getPhotoObjectId())
                    .workScheduleName(evaluation.getWorkScheduleName())
                    .previousBalanceMinutes(previous)
                    .periodCreditMinutes(credit)
                    .periodDebitMinutes(debit)
                    .periodBalanceMinutes(credit - debit)
                    .totalBalanceMinutes(previous + credit - debit)
                    .build());
        }
        return HourBankResponseDto.builder()
                .enabled(true)
                .accrualStart(accrualStart)
                .periodStart(period[0])
                .periodEnd(period[1])
                .rows(rows)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('hourbank:read')")
    public HourBankResponseDto.Statement statement(UUID collaboratorId, LocalDate from, LocalDate to) {
        TimeTrackingSettings settings = evaluationService.settings();
        LocalDate[] period = period(from, to);
        LocalDate accrualStart = settings.getHourBankStartDate();
        LocalDate evaluationStart = accrualStart.isBefore(period[0]) ? accrualStart : period[0];
        CollaboratorPeriodEvaluation evaluation = evaluationService
                .evaluate(evaluationStart, period[1], List.of(collaboratorId), settings)
                .stream()
                .findFirst()
                .orElseThrow(AttendanceRecordException::notFound);
        int running = 0;
        int previous = 0;
        List<HourBankResponseDto.StatementLine> lines = new ArrayList<>();
        for (AttendanceDayEvaluation day : evaluation.getDays()) {
            boolean accrues = settings.isHourBankEnabled() && !day.getDate().isBefore(accrualStart);
            int bank = accrues ? day.getHourBankMinutes() : 0;
            running += bank;
            if (day.getDate().isBefore(period[0])) {
                previous = running;
                continue;
            }
            lines.add(HourBankResponseDto.StatementLine.builder()
                    .date(day.getDate())
                    .status(day.getStatus().name())
                    .expectedMinutes(day.getExpectedMinutes())
                    .workedMinutes(day.getWorkedMinutes())
                    .hourBankMinutes(bank)
                    .runningBalanceMinutes(running)
                    .build());
        }
        return HourBankResponseDto.Statement.builder()
                .collaboratorId(collaboratorId)
                .collaboratorName(evaluation.getCollaboratorName())
                .accrualStart(accrualStart)
                .previousBalanceMinutes(previous)
                .totalBalanceMinutes(running)
                .lines(lines)
                .build();
    }

    private LocalDate[] period(LocalDate from, LocalDate to) {
        LocalDate today = evaluationService.today();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : today;
        return start.isAfter(end) ? new LocalDate[] {end, start} : new LocalDate[] {start, end};
    }
}
