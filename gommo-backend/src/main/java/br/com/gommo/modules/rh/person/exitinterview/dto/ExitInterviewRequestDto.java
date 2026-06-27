package br.com.gommo.modules.rh.person.exitinterview.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewReasonEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRehireAnswerEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewRelationshipTypeEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewStatusEnum;
import br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterviewTerminationTypeEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExitInterviewRequestDto {
    @NotNull
    private UUID collaboratorId;

    @NotNull
    private LocalDate interviewDate;

    @Size(max = 255)
    private String departureReason;

    private String feedback;
    private Boolean wouldRecommend;

    private ExitInterviewStatusEnum interviewStatus;

    @NotNull
    private ExitInterviewRelationshipTypeEnum relationshipType;

    @Size(max = 200)
    private String collaboratorName;

    @Size(max = 60)
    private String registrationNumber;

    @Size(max = 160)
    private String jobPositionName;

    @Size(max = 160)
    private String departmentName;

    @Size(max = 200)
    private String companyName;

    @Size(max = 200)
    private String managerName;

    private LocalDate admissionOrContractStartDate;
    private LocalDate terminationOrContractEndDate;
    private Integer tenureDays;
    private ExitInterviewTerminationTypeEnum terminationType;

    @Size(max = 200)
    private String interviewerName;

    private ExitInterviewReasonEnum mainReason;

    @Builder.Default
    private List<ExitInterviewReasonEnum> secondaryReasons = new ArrayList<>();

    private String detailedReason;

    @Valid
    @Builder.Default
    private List<ExitInterviewRatingDto> ratings = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<ExitInterviewAnswerDto> openAnswers = new ArrayList<>();

    private ExitInterviewRehireAnswerEnum wouldReturn;
    private ExitInterviewRehireAnswerEnum companyWouldRehire;
    private String rehireNotes;

    @Valid
    @Builder.Default
    private List<ExitInterviewReturnChecklistItemDto> returnChecklist = new ArrayList<>();

    @Size(max = 100)
    private String templateKey;

    private Integer templateVersion;

    @Builder.Default
    private Map<String, Object> templatePayload = Map.of();
}