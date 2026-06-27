package br.com.gommo.modules.rh.person.exitinterview.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewReasonEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRehireAnswerEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRelationshipTypeEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewStatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewTerminationTypeEnum;

@Getter
@Builder
public class ExitInterviewResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final LocalDate interviewDate;
    private final String departureReason;
    private final String feedback;
    private final Boolean wouldRecommend;
    private final ExitInterviewStatusEnum interviewStatus;
    private final ExitInterviewRelationshipTypeEnum relationshipType;
    private final String collaboratorName;
    private final String registrationNumber;
    private final String jobPositionName;
    private final UUID jobPositionId;
    private final String departmentName;
    private final UUID departmentId;
    private final String companyName;
    private final String managerName;
    private final LocalDate admissionOrContractStartDate;
    private final LocalDate terminationOrContractEndDate;
    private final Integer tenureDays;
    private final ExitInterviewTerminationTypeEnum terminationType;
    private final String interviewerName;
    private final ExitInterviewReasonEnum mainReason;
    private final List<ExitInterviewReasonEnum> secondaryReasons;
    private final String detailedReason;
    private final List<ExitInterviewRatingDto> ratings;
    private final List<ExitInterviewAnswerDto> openAnswers;
    private final ExitInterviewRehireAnswerEnum wouldReturn;
    private final ExitInterviewRehireAnswerEnum companyWouldRehire;
    private final String rehireNotes;
    private final List<ExitInterviewReturnChecklistItemDto> returnChecklist;
    private final String templateKey;
    private final Integer templateVersion;
    private final Map<String, Object> templatePayload;
    private final OffsetDateTime completedAt;
    private final OffsetDateTime canceledAt;
    private final String cancelReason;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
