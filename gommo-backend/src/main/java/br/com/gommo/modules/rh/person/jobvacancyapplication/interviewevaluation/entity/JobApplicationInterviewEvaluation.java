package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity;

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

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.Filter;
import org.hibernate.envers.Audited;

import br.com.gommo.core.branch.BranchScopedEntity;

@Entity
@Audited
@Table(name = "job_application_interview_evaluation")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Filter(name = BranchScopedEntity.FILTER_NAME, condition = BranchScopedEntity.FILTER_CONDITION)
public class JobApplicationInterviewEvaluation extends BranchScopedEntity {

    @Column(name = "job_vacancy_application_id", nullable = false)
    private UUID jobVacancyApplicationId;

    @Column(name = "column_key", nullable = false, length = 80)
    private String columnKey;

    @Column(name = "evaluator_user_id", nullable = false)
    private UUID evaluatorUserId;

    @Column(name = "evaluator_name", length = 200)
    private String evaluatorName;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "evaluation_status", nullable = false, length = 20)
    private InterviewEvaluationStatusEnum evaluationStatus = InterviewEvaluationStatusEnum.DRAFT;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation", length = 40)
    private InterviewRecommendationEnum recommendation;
}
