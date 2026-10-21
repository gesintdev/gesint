package br.com.gesint.modules.dp.organization.jobpositionsalarytable.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryLevelEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionSalaryTableItemRequestDto {

    @NotNull private JobPositionSalaryLevelEnum level;

    @NotNull private BigDecimal minSalary;

    @NotNull private BigDecimal referenceSalary;

    @NotNull private BigDecimal maxSalary;
}
