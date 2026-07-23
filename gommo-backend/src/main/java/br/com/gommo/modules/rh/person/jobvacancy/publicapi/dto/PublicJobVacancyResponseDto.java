package br.com.gommo.modules.rh.person.jobvacancy.publicapi.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyWorkModalityEnum;

@Getter
@Builder
public class PublicJobVacancyResponseDto {
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
    private final JobVacancyWorkModalityEnum workModality;
    private final JobVacancyContractTypeEnum contractType;
    private final String workSchedule;
    private final JobVacancySeniorityEnum seniorityLevel;
    private final BigDecimal salary;
    private final BigDecimal salaryMax;
    private final OffsetDateTime publishedAt;
}
