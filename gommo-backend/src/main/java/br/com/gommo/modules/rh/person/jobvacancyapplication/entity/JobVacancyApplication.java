package br.com.gommo.modules.rh.person.jobvacancyapplication.entity;

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
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.core.branch.BranchScopedEntity;
import br.com.gommo.modules.rh.person.jobvacancyapplication.dto.JobVacancyApplicationStageCommentDto;

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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false, length = 32)
    private JobVacancyApplicationStatusEnum applicationStatus = JobVacancyApplicationStatusEnum.APPLIED;

    @Builder.Default
    @Column(name = "applied_at", nullable = false)
    private OffsetDateTime appliedAt = OffsetDateTime.now();

    @Column(name = "kanban_column_key", length = 80)
    private String kanbanColumnKey;

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
}
