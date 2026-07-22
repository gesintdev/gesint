package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationStatusEnum;

@Getter
@Builder
public class JobVacancyApplicationResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobVacancyId;
    private final String jobVacancyTitle;
    private final UUID candidateId;
    private final String candidateFullName;
    private final String candidateCpf;
    private final String candidateEmail;
    private final String candidatePhone;
    private final JobVacancyApplicationStatusEnum applicationStatus;
    private final String kanbanColumnKey;
    private final Map<String, JobVacancyApplicationStageCommentDto> stageComments;
    private final OffsetDateTime appliedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
