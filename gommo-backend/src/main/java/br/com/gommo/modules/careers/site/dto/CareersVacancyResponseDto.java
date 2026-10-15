package br.com.gommo.modules.careers.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Pagina da vaga (/careers/[slug]) com a identidade visual e o aviso de privacidade vigente. */
@Getter
@Builder
public class CareersVacancyResponseDto {
    private final String slug;
    private final Integer code;
    private final String jobTitle;
    private final String description;
    private final String activities;
    private final String assignments;
    private final String requirements;
    private final String benefits;
    private final String department;
    private final String location;
    private final String workModality;
    private final String contractType;
    private final String workSchedule;
    private final String seniorityLevel;
    private final BigDecimal salary;
    private final BigDecimal salaryMax;
    private final OffsetDateTime publishedAt;
    private final LocalDate expectedCompletionDate;
    private final Boolean publishGoogleJobs;
    private final String organizationName;
    private final boolean customized;
    private final CareersBrandingDto branding;
    private final CareersPrivacyDto privacy;
}
