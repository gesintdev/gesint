package br.com.gesint.modules.careers.integration;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** Candidatura publica ja validada pelo site (dado minimo + consentimentos). */
@Getter
@Builder
public class CareersApplicationCommand {
    private final UUID vacancyId;
    private final UUID companyId;
    private final String vacancyTitle;
    private final String fullName;
    private final String email;
    private final String phone;
    private final String city;
    private final String stateCode;
    private final String linkedinUrl;
    private final String portfolioUrl;
    private final String coverLetter;
    private final String referralSource;
    private final BigDecimal salaryExpectation;
    private final List<CareersExperience> experiences;
    private final OffsetDateTime privacyConsentAt;
    private final String privacyConsentVersion;
    private final OffsetDateTime talentPoolConsentAt;
    private final String talentPoolConsentVersion;
    private final LocalDate talentPoolConsentUntil;
}
