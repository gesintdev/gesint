package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.rh.person.contract.entity.ContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.CandidateAcceptanceEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationOfferResponseDto {

    private UUID applicationId;
    private CandidateAcceptanceEnum candidateAcceptance;
    private OffsetDateTime offerSentAt;
    private ContractTypeEnum contractType;
    private BigDecimal baseSalary;
    private LocalDate expectedStartDate;
    private String experiencePeriod;
    private UUID workScheduleId;
    private String candidateFullName;
    private String jobVacancyTitle;
}
