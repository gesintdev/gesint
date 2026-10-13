package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationHirePreviewDto {

    private UUID applicationId;
    private UUID candidateId;
    private String candidateFullName;
    private String candidateCpf;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateBirthDate;
    private UUID jobVacancyId;
    private String jobVacancyTitle;
    private UUID jobPositionId;
    private JobVacancyContractTypeEnum vacancyContractType;
    private ContractTypeEnum suggestedContractType;
    private JobRequisitionExperiencePeriodEnum suggestedExperiencePeriod;
    private BigDecimal suggestedSalary;
    private BigDecimal suggestedSalaryMax;
    private String vacancyWorkSchedule;
    private boolean alreadyHired;
    private UUID admissionProcessId;
    private String rehireWarning;
    private int otherActiveApplicationsCount;
}
