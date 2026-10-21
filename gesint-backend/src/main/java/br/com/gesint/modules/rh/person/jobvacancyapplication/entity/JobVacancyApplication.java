package br.com.gesint.modules.rh.person.jobvacancyapplication.entity;

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
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.envers.Audited;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import br.com.gesint.core.branch.BranchScopedEntity;
import br.com.gesint.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentDto;

@Entity
@Audited
@Table(name = "job_vacancy_application")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class JobVacancyApplication extends BranchScopedEntity {
    @Column(name = "job_vacancy_id", nullable = false)
    private UUID jobVacancyId;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "admission_process_id")
    private UUID admissionProcessId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false, length = 32)
    private JobVacancyApplicationStatusEnum applicationStatus = JobVacancyApplicationStatusEnum.APPLIED;

    @Builder.Default
    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt = OffsetDateTime.now();

    @Column(name = "kanban_column_key", length = 80)
    private String kanbanColumnKey;

    @Column(name = "kanban_column_entered_at")
    private OffsetDateTime kanbanColumnEnteredAt;

    @Column(name = "kanban_sla_last_reminder_date")
    private LocalDate kanbanSlaLastReminderDate;

    @Column(name = "kanban_sla_candidate_notified_at")
    private OffsetDateTime kanbanSlaCandidateNotifiedAt;

    /** Comentarios por etapa do kanban, chave = column_key. */
    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "stage_comments", columnDefinition = "jsonb", nullable = false)
    private Map<String, JobVacancyApplicationStageCommentDto> stageComments = new LinkedHashMap<>();

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "referral_source", length = 80)
    private String referralSource;

    @Column(name = "salary_expectation", precision = 14, scale = 2)
    private BigDecimal salaryExpectation;

    @Column(name = "ai_score", precision = 5, scale = 2)
    private BigDecimal aiScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_status", length = 32)
    private ApplicationAiStatusEnum aiStatus;

    @Column(name = "ai_analyzed_at")
    private OffsetDateTime aiAnalyzedAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_analysis", columnDefinition = "jsonb")
    private Map<String, Object> aiAnalysis;

    @Column(name = "privacy_consent_at")
    private OffsetDateTime privacyConsentAt;

    @Column(name = "privacy_consent_version", length = 40)
    private String privacyConsentVersion;

    @Column(name = "talent_pool_consent_at")
    private OffsetDateTime talentPoolConsentAt;

    @Column(name = "talent_pool_consent_version", length = 40)
    private String talentPoolConsentVersion;

    @Column(name = "talent_pool_consent_until")
    private LocalDate talentPoolConsentUntil;

    /** Dados enviados na candidatura publica; o cadastro do candidato existente nunca e sobrescrito. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "applicant_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> applicantSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "rejection_reason", length = 48)
    private JobVacancyApplicationRejectionReasonEnum rejectionReason;

    @Column(name = "rejection_requirement", length = 300)
    private String rejectionRequirement;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    private String rejectionNote;

    @Column(name = "rejected_at")
    private OffsetDateTime rejectedAt;

    @Column(name = "rejected_by")
    private UUID rejectedBy;

    @Column(name = "rejected_by_name", length = 200)
    private String rejectedByName;

    @Enumerated(EnumType.STRING)
    @Column(name = "rejection_feedback_status", length = 16)
    private RejectionFeedbackStatusEnum rejectionFeedbackStatus;

    @Column(name = "rejection_feedback_at")
    private OffsetDateTime rejectionFeedbackAt;

    @Column(name = "rejection_feedback_detail", length = 500)
    private String rejectionFeedbackDetail;

    @Enumerated(EnumType.STRING)
    @Column(name = "candidate_acceptance", length = 32)
    private CandidateAcceptanceEnum candidateAcceptance;

    @Column(name = "acceptance_date")
    private LocalDate acceptanceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "acceptance_channel", length = 32)
    private AcceptanceChannelEnum acceptanceChannel;

    @Column(name = "offer_sent_at")
    private OffsetDateTime offerSentAt;

    @Column(name = "offer_contract_type", length = 32)
    private String offerContractType;

    @Column(name = "offer_base_salary", precision = 14, scale = 2)
    private BigDecimal offerBaseSalary;

    @Column(name = "offer_expected_start_date")
    private LocalDate offerExpectedStartDate;

    @Column(name = "offer_experience_period", length = 32)
    private String offerExperiencePeriod;

    @Column(name = "offer_work_schedule_id")
    private UUID offerWorkScheduleId;

    @Column(name = "offer_decline_reason", length = 500)
    private String offerDeclineReason;

    public boolean isRejected() {
        return rejectionReason != null;
    }

    public void clearRejection() {
        rejectionReason = null;
        rejectionRequirement = null;
        rejectionNote = null;
        rejectedAt = null;
        rejectedBy = null;
        rejectedByName = null;
        rejectionFeedbackStatus = null;
        rejectionFeedbackAt = null;
        rejectionFeedbackDetail = null;
    }
}
