package br.com.gesint.modules.gp.attendance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.gp.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gesint.modules.gp.attendance.entity.AttendanceOccurrenceTypeEnum;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendancePresenceResponseDto {
    private final String id;
    private final boolean hasRecord;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final UUID photoObjectId;
    private final LocalDate workDate;
    private final LocalTime clockIn;
    private final LocalTime clockOut;
    private final LocalTime breakStart;
    private final LocalTime breakEnd;
    private final Integer breakMinutes;
    private final AttendanceOccurrenceTypeEnum occurrenceType;
    private final AttendanceOccurrenceOriginEnum occurrenceOrigin;
    private final UUID referenceId;
    private final BigDecimal expectedHours;
    private final BigDecimal workedHours;
    /** Soma dos débitos diários (esperado − trabalhado) no período. */
    private final BigDecimal debitHours;
    /** Soma dos créditos diários / hora extra (trabalhado − esperado) no período. */
    private final BigDecimal creditHours;
    private final Boolean impactsHourBank;
    private final Boolean impactsPayroll;
    private final String notes;
    private final boolean inVacation;
    private final boolean onLeaveActive;
    /** True when the collaborator has at least one pending adjustment request in the queried period. */
    private final boolean pendingAdjustmentRequest;
    private final UUID workScheduleId;
    private final String workScheduleName;
    private final String jobTitle;
    /** Minutos trabalhados no periodo (apuracao do Gestao de Ponto). */
    private final int workedMinutes;
    /** Horas extras pagas em folha no periodo (so quando a empresa usa esse regime). */
    private final int overtimeMinutes;
    /** Saldo do banco de horas gerado no periodo. */
    private final int hourBankPeriodMinutes;
    /** Saldo acumulado do banco de horas ate o fim do periodo. */
    private final int hourBankBalanceMinutes;
    /** Dias com pendencia (incompleto, sem registro ou ajuste aguardando decisao). */
    private final int pendingCount;
    private final int incompleteDays;
    private final int missingDays;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
