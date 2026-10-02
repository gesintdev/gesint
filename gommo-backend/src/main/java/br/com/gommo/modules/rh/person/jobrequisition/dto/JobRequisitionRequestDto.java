package br.com.gommo.modules.rh.person.jobrequisition.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRequisitionRequestDto {
    @NotNull
    private UUID jobPositionId;

    private JobPositionSalaryLevelEnum salaryLevel;
    private JobVacancyContractTypeEnum contractType;
    private JobRequisitionExperiencePeriodEnum experiencePeriod;

    @NotNull
    @Min(1)
    private Integer positionsCount;

    private LocalDate desiredStartDate;

    @NotNull
    private JobRequisitionReasonEnum reason;

    private UUID offboardingId;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal proposedSalary;

    private String justification;
}
