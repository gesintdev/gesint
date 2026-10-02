package br.com.gommo.modules.rh.person.jobrequisition.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.branch.BranchScopedEntity;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;

@Entity
@Audited
@Table(name = "job_requisition")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class JobRequisition extends BranchScopedEntity {
    @Column(name = "job_position_id", nullable = false)
    private UUID jobPositionId;

    @Column(name = "job_position_title", length = 200)
    private String jobPositionTitle;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "salary_level", columnDefinition = "gommo_types.job_position_salary_level_enum")
    private JobPositionSalaryLevelEnum salaryLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 32)
    private JobVacancyContractTypeEnum contractType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_period", length = 32)
    private JobRequisitionExperiencePeriodEnum experiencePeriod;

    @Builder.Default
    @Column(name = "positions_count", nullable = false)
    private Integer positionsCount = 1;

    @Column(name = "desired_start_date")
    private LocalDate desiredStartDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 32)
    private JobRequisitionReasonEnum reason;

    @Column(name = "offboarding_id")
    private UUID offboardingId;

    @Column(name = "replaced_collaborator_id")
    private UUID replacedCollaboratorId;

    @Column(name = "replaced_collaborator_name", length = 200)
    private String replacedCollaboratorName;

    @Column(name = "replaced_dismissal_date")
    private LocalDate replacedDismissalDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "replaced_dismissal_type", length = 32)
    private DismissalTypeEnum replacedDismissalType;

    @Column(name = "proposed_salary", precision = 14, scale = 2)
    private BigDecimal proposedSalary;

    @Column(name = "band_min_salary", precision = 14, scale = 2)
    private BigDecimal bandMinSalary;

    @Column(name = "band_reference_salary", precision = 14, scale = 2)
    private BigDecimal bandReferenceSalary;

    @Column(name = "band_max_salary", precision = 14, scale = 2)
    private BigDecimal bandMaxSalary;

    @Builder.Default
    @Column(name = "out_of_band", nullable = false)
    private Boolean outOfBand = false;

    @Column(columnDefinition = "TEXT")
    private String justification;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "requisition_status", nullable = false, length = 32)
    private JobRequisitionStatusEnum requisitionStatus = JobRequisitionStatusEnum.DRAFT;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "manager_approved_by")
    private UUID managerApprovedBy;

    @Column(name = "manager_approved_by_name", length = 200)
    private String managerApprovedByName;

    @Column(name = "manager_approved_at")
    private OffsetDateTime managerApprovedAt;

    @Column(name = "hr_approved_by")
    private UUID hrApprovedBy;

    @Column(name = "hr_approved_by_name", length = 200)
    private String hrApprovedByName;

    @Column(name = "hr_approved_at")
    private OffsetDateTime hrApprovedAt;

    @Column(name = "director_approved_by")
    private UUID directorApprovedBy;

    @Column(name = "director_approved_by_name", length = 200)
    private String directorApprovedByName;

    @Column(name = "director_approved_at")
    private OffsetDateTime directorApprovedAt;

    @Column(name = "rejected_by")
    private UUID rejectedBy;

    @Column(name = "rejected_by_name", length = 200)
    private String rejectedByName;

    @Column(name = "rejected_at")
    private OffsetDateTime rejectedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "rejected_stage", length = 32)
    private JobRequisitionStatusEnum rejectedStage;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @Column(name = "job_vacancy_id")
    private UUID jobVacancyId;
}
