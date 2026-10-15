package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.jobrequisition.entity.JobRequisitionExperiencePeriodEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.AcceptanceChannelEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.CandidateAcceptanceEnum;

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

    private CandidateAcceptanceEnum candidateAcceptance;
    private LocalDate acceptanceDate;
    private AcceptanceChannelEnum acceptanceChannel;
    /** Proposta enviada ao portal e ainda aguardando resposta. */
    private boolean offerPending;
    private boolean portalAccepted;
    private boolean portalDeclined;
    private OffsetDateTime offerSentAt;
    private LocalDate offerExpectedStartDate;
    private BigDecimal offerBaseSalary;
    private ContractTypeEnum offerContractType;
    private String offerExperiencePeriod;
    private UUID offerWorkScheduleId;
    /** Vaga afirmativa PCD — só informa o RH; autodeclaração fica na pré-admissão. */
    private boolean affirmativePcd;
}
