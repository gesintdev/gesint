package br.com.gommo.modules.careers.candidateportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalOfferDto {
    private final UUID applicationId;
    private final String jobTitle;
    private final String location;
    private final String contractType;
    private final BigDecimal baseSalary;
    private final LocalDate expectedStartDate;
    private final String experiencePeriod;
    private final OffsetDateTime offerSentAt;
    private final String candidateAcceptance;
    private final boolean actionable;
}
