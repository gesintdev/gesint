package br.com.gommo.modules.rh.person.jobvacancy.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;

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
    private final JobVacancySeniorityEnum seniorityLevel;
    private final BigDecimal salary;
    private final LocalDate expectedCompletionDate;
    private final List<String> targetBoards;
    private final Integer candidateCount;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
