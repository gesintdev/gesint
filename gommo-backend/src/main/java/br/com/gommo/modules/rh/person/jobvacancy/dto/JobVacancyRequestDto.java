package br.com.gommo.modules.rh.person.jobvacancy.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyContractTypeEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancySeniorityEnum;
import br.com.gommo.modules.rh.person.jobvacancy.entity.JobVacancyWorkModalityEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyRequestDto {
    private UUID jobPositionId;

    @NotBlank
    @Size(max = 200)
    private String jobTitle;

    @NotNull
    @Min(1)
    private Integer positionsCount;

    private String description;
    private String activities;
    private String assignments;
    private String requirements;
    private String benefits;

    @Size(max = 200)
    private String department;

    @Size(max = 200)
    private String location;

    private JobVacancyWorkModalityEnum workModality;
    private JobVacancyContractTypeEnum contractType;

    @Size(max = 80)
    private String workSchedule;

    private JobVacancySeniorityEnum seniorityLevel;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal salary;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal salaryMax;

    private LocalDate expectedCompletionDate;

    @Builder.Default
    private List<String> targetBoards = new ArrayList<>();

    @Size(max = 120)
    private String slug;

    @JsonProperty("isPublic")
    private Boolean isPublic;
}
