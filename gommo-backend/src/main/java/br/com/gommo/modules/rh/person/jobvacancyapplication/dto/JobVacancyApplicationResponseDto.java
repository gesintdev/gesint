package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.ApplicationAiStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationRejectionReasonEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.RejectionFeedbackStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto.InterviewCompetencyAverageDto;

@Getter
@Builder
public class JobVacancyApplicationResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobVacancyId;
    private final String jobVacancyTitle;
    private final UUID admissionProcessId;
    private final UUID candidateId;
    private final String candidateFullName;
    private final String candidateCpf;
    private final String candidateEmail;
    private final String candidatePhone;
    private final JobVacancyApplicationStatusEnum applicationStatus;
    private final String kanbanColumnKey;
    private final Map<String, JobVacancyApplicationStageCommentDto> stageComments;
    private final OffsetDateTime appliedAt;
    private final java.math.BigDecimal salaryExpectation;
    private final java.math.BigDecimal aiScore;
    private final ApplicationAiStatusEnum aiStatus;
    private final OffsetDateTime aiAnalyzedAt;
    private final Map<String, Object> aiAnalysis;
    private final JobVacancyApplicationRejectionReasonEnum rejectionReason;
    private final String rejectionReasonLabel;
    private final String rejectionRequirement;
    private final String rejectionNote;
    private final OffsetDateTime rejectedAt;
    private final UUID rejectedBy;
    private final String rejectedByName;
    private final RejectionFeedbackStatusEnum rejectionFeedbackStatus;
    private final OffsetDateTime rejectionFeedbackAt;
    private final String rejectionFeedbackDetail;
    @Builder.Default
    private final List<InterviewCompetencyAverageDto> interviewAverages = new ArrayList<>();
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
