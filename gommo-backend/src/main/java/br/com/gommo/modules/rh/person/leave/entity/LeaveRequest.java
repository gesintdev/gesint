package br.com.gommo.modules.rh.person.leave.entity;

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
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.rh.person.contract.recess.entity.RecessFinancialModeEnum;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "absence_status", length = 30)
    private LeaveAbsenceStatusEnum absenceStatus;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "cid", length = 20)
    private String cid;

    @Column(name = "physician_name", length = 180)
    private String physicianName;

    @Column(name = "physician_crm", length = 40)
    private String physicianCrm;

    @Column(name = "certificate_source", length = 80)
    private String certificateSource;

    @Column(name = "requires_inss", nullable = false)
    private Boolean requiresInss;

    @Column(name = "inss_referral_date")
    private LocalDate inssReferralDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "work_accident_stability", nullable = false)
    private Boolean workAccidentStability;

    @Column(name = "related_certificate_days")
    private Integer relatedCertificateDays;

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

    @Column(name = "reviewed_at")
    private OffsetDateTime reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "recess_period_id")
    private UUID recessPeriodId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "recess_financial_mode", columnDefinition = "recess_financial_mode_enum")
    private RecessFinancialModeEnum recessFinancialMode;

    @Column(name = "recess_paid_percentage", precision = 5, scale = 2)
    private BigDecimal recessPaidPercentage;
}
