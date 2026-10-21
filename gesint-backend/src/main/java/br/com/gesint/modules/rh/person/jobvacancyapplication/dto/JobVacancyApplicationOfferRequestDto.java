package br.com.gesint.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gesint.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationOfferRequestDto {

    @NotNull private ContractTypeEnum contractType;

    private JobRequisitionExperiencePeriodEnum experiencePeriod;

    @NotNull private LocalDate expectedStartDate;

    private BigDecimal baseSalary;

    private UUID workScheduleId;
}
