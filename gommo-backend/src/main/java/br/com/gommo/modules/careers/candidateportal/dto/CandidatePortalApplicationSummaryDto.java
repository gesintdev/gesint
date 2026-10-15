package br.com.gommo.modules.careers.candidateportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalApplicationSummaryDto {
    private final UUID applicationId;
    private final UUID vacancyId;
    private final String vacancySlug;
    private final String jobTitle;
    private final String location;
    private final OffsetDateTime appliedAt;
    private final String stageKey;
    private final String stageLabel;
    private final String resultLabel;
    private final boolean withdrawable;
    private final List<CandidatePortalTimelineStepDto> timeline;

    /** Proposta de contratação aguardando aceite no portal. */
    private final boolean offerPending;
    private final boolean offerAccepted;
    private final boolean offerDeclined;
    private final String offerContractType;
    private final BigDecimal offerBaseSalary;
    private final LocalDate offerExpectedStartDate;
    private final OffsetDateTime offerSentAt;

    /** Admissão já criada — candidato pode completar pré-admissão. */
    private final boolean preAdmissionAvailable;
    private final UUID admissionProcessId;
}
