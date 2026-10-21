package br.com.gesint.modules.careers.site.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Builder
public class CareersVacancySummaryDto {
    private final String slug;
    private final Integer code;
    private final String jobTitle;
    private final String department;
    private final String location;
    private final String workModality;
    private final String contractType;
    private final String seniorityLevel;
    private final BigDecimal salary;
    private final BigDecimal salaryMax;
    private final OffsetDateTime publishedAt;
    private final LocalDate expectedCompletionDate;
}
