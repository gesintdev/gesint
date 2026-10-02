package br.com.gommo.modules.rh.person.jobrequisition.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionStatusEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;

@Getter
@Builder
public class JobRequisitionResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID companyId;
    private final UUID jobPositionId;
    private final String jobPositionTitle;
    private final JobPositionSalaryLevelEnum salaryLevel;
    private final JobVacancyContractTypeEnum contractType;
    private final JobRequisitionExperiencePeriodEnum experiencePeriod;
    private final Integer positionsCount;
    private final LocalDate desiredStartDate;
    private final JobRequisitionReasonEnum reason;
    private final UUID offboardingId;
    private final UUID replacedCollaboratorId;
    private final String replacedCollaboratorName;
    private final LocalDate replacedDismissalDate;
    private final DismissalTypeEnum replacedDismissalType;
    private final BigDecimal proposedSalary;
    private final BigDecimal bandMinSalary;
    private final BigDecimal bandReferenceSalary;
    private final BigDecimal bandMaxSalary;
    private final Boolean outOfBand;
    private final String justification;
    private final JobRequisitionStatusEnum requisitionStatus;
    private final OffsetDateTime submittedAt;
    private final String managerApprovedByName;
    private final OffsetDateTime managerApprovedAt;
    private final String hrApprovedByName;
    private final OffsetDateTime hrApprovedAt;
    private final String directorApprovedByName;
    private final OffsetDateTime directorApprovedAt;
    private final String rejectedByName;
    private final OffsetDateTime rejectedAt;
    private final JobRequisitionStatusEnum rejectedStage;
    private final String rejectionReason;
    private final OffsetDateTime canceledAt;
    private final UUID jobVacancyId;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
