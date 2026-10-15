package br.com.gommo.modules.careers.integration;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Vaga publicada vista pelo site de carreiras. Enums do RH chegam como texto (nome da constante). */
@Getter
@Builder
public class CareersVacancy {
    private final UUID id;
    private final UUID companyId;
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
    /** Quando false, a página pública omite o JSON-LD JobPosting (Google for Jobs). Default true. */
    private final Boolean publishGoogleJobs;
}
