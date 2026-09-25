package br.com.gommo.modules.dp.organization.jobpositionsalarytable.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.gommo.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;

@Getter
@Builder
public class JobPositionSalaryTableItemResponseDto {

    private final UUID id;
    private final JobPositionSalaryLevelEnum level;
    private final BigDecimal minSalary;
    private final BigDecimal referenceSalary;
    private final BigDecimal maxSalary;
}
