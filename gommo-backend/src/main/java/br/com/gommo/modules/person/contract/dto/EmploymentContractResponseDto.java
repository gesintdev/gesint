package br.com.gommo.modules.person.contract.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;

@Getter
@Builder
public class EmploymentContractResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final UUID companyId;
    private final UUID jobPositionId;
    private final ContractTypeEnum contractType;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal baseSalary;
    private final BigDecimal workloadHours;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
