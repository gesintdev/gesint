package br.com.gesint.modules.rh.person.experience.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperienceDecisionEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperienceEvaluationStatusEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceEvaluationResponseDto {
    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID companyId;
    private UUID collaboratorId;
    private UUID admissionProcessId;
    private UUID jobPositionId;
    private String collaboratorName;
    private String jobPositionName;
    private LocalDate admissionDate;
    private ExperiencePeriodEnum experiencePeriod;
    private boolean experienceExtensionUsed;
    private Integer experienceMilestoneDays;
    private LocalDate experienceDueDate;
    private ExperiencePeriodStatusEnum periodStatus;
    private ExperienceEvaluationStatusEnum evaluationStatus;
    private UUID evaluatorUserId;
    private String evaluatorName;
    private OffsetDateTime submittedAt;
    private BigDecimal averageScore;
    private BigDecimal selectionAverage;
    private ExperienceDecisionEnum decision;
    private String decisionReason;
    private String decisionNotes;
    private UUID decidedBy;
    private String decidedByName;
    private OffsetDateTime decidedAt;
    private UUID offboardingId;
    private boolean canExtend;
    private boolean decided;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Builder.Default
    private List<ExperienceCompetencyDto> competencies = new ArrayList<>();

    @Builder.Default
    private List<ExperienceScoreViewDto> scores = new ArrayList<>();
}
