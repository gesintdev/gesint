package br.com.gommo.modules.person.contract.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentContractRequestDto {
    @NotNull private UUID collaboratorId;

    private UUID companyId;
    private UUID jobPositionId;
    private ContractTypeEnum contractType;

    @NotNull private LocalDate startDate;

    private LocalDate endDate;
    private BigDecimal baseSalary;
    private BigDecimal workloadHours;
    private String notes;
}
