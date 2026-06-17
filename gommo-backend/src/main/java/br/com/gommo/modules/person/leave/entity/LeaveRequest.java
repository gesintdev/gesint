package br.com.gommo.modules.person.leave.entity;

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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "leave_request")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest extends AuditEntity {
    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "leave_type", nullable = false, columnDefinition = "leave_type_enum")
    private LeaveTypeEnum leaveType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Boolean approved;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "pecuniary_allowance_days", nullable = false)
    private Integer pecuniaryAllowanceDays;

    @Column(name = "unjustified_absences")
    private Integer unjustifiedAbsences;

    @Column(name = "vacation_days_entitled")
    private Integer vacationDaysEntitled;

    @Column(name = "acquisition_period_start")
    private LocalDate acquisitionPeriodStart;

    @Column(name = "acquisition_period_end")
    private LocalDate acquisitionPeriodEnd;

    @Column(name = "split_group_id")
    private UUID splitGroupId;

    @Column(name = "split_sequence")
    private Integer splitSequence;

    @Column(name = "base_salary_snapshot", precision = 14, scale = 2)
    private BigDecimal baseSalarySnapshot;

    @Column(name = "justified_absences")
    private Integer justifiedAbsences;

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status", length = 20)
    private VacationReviewStatusEnum reviewStatus;

    @Column(name = "review_reason", columnDefinition = "TEXT")
    private String reviewReason;
}
