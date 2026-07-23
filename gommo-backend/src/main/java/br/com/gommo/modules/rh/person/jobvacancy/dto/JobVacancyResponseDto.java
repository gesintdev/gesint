package br.com.gommo.modules.rh.person.jobvacancy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyWorkModalityEnum;

@Getter
@Builder
public class JobVacancyResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobPositionId;
    private final String jobTitle;
    private final Integer positionsCount;
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
    private final LocalDate expectedCompletionDate;
    private final List<String> targetBoards;
    private final String slug;
    @JsonProperty("isPublic")
    private final Boolean isPublic;
    private final OffsetDateTime publishedAt;
    private final Integer candidateCount;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
