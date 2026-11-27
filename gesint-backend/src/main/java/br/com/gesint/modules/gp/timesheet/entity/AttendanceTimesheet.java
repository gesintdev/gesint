package br.com.gesint.modules.gp.timesheet.entity;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import br.com.gesint.core.branch.BranchScopedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Espelho de ponto de um colaborador num periodo. Fechar guarda os totais apurados naquele
 * momento e trava as marcacoes do periodo; reabrir exige motivo.
 */
@Entity
@Audited
@Table(name = "attendance_timesheet")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class AttendanceTimesheet extends BranchScopedEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "closing_status", nullable = false, length = 20)
    private TimesheetClosingStatusEnum closingStatus;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @Column(name = "closed_by")
    private UUID closedBy;

    @Column(name = "reopen_reason", columnDefinition = "TEXT")
    private String reopenReason;

    @Column(name = "worked_minutes")
    private Integer workedMinutes;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;

    @Column(name = "hour_bank_minutes")
    private Integer hourBankMinutes;

    @Column(name = "pending_days")
    private Integer pendingDays;
}
