package br.com.gommo.modules.rh.person.experience.entity;

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
import org.hibernate.envers.Audited;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "experience_evaluation")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class ExperienceEvaluation extends BranchScopedEntity {

    @Column(name = "collaborator_id", nullable = false)
    private UUID collaboratorId;

    @Column(name = "admission_process_id", nullable = false)
    private UUID admissionProcessId;

    @Column(name = "job_position_id")
    private UUID jobPositionId;

    @Column(name = "collaborator_name", length = 200)
    private String collaboratorName;

    @Column(name = "job_position_name", length = 200)
    private String jobPositionName;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_period", nullable = false, length = 32)
    private ExperiencePeriodEnum experiencePeriod;

    @Builder.Default
    @Column(name = "experience_extension_used", nullable = false)
    private boolean experienceExtensionUsed = false;

    @Column(name = "experience_milestone_days", nullable = false)
    private Integer experienceMilestoneDays;

    @Column(name = "experience_due_date", nullable = false)
    private LocalDate experienceDueDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "period_status", nullable = false, length = 32)
    private ExperiencePeriodStatusEnum periodStatus = ExperiencePeriodStatusEnum.IN_PERIOD;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_status", nullable = false, length = 20)
    private ExperienceEvaluationStatusEnum evaluationStatus = ExperienceEvaluationStatusEnum.DRAFT;

    @Column(name = "evaluator_user_id")
    private UUID evaluatorUserId;

    @Column(name = "evaluator_name", length = 200)
    private String evaluatorName;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "average_score", precision = 4, scale = 1)
    private BigDecimal averageScore;

    @Column(name = "selection_average", precision = 4, scale = 1)
    private BigDecimal selectionAverage;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", length = 32)
    private ExperienceDecisionEnum decision;

    @Column(name = "decision_reason", length = 255)
    private String decisionReason;

    @Column(name = "decision_notes", columnDefinition = "TEXT")
    private String decisionNotes;

    @Column(name = "decided_by")
    private UUID decidedBy;

    @Column(name = "decided_by_name", length = 200)
    private String decidedByName;

    @Column(name = "decided_at")
    private OffsetDateTime decidedAt;

    @Column(name = "offboarding_id")
    private UUID offboardingId;
}
