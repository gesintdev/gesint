package br.com.gommo.modules.person.contract.dto;
import br.com.gommo.modules.person.contract.entity.ContractTypeEnum;
import jakarta.validation.constraints.NotNull; import java.math.BigDecimal; import java.time.LocalDate; import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmploymentContractRequestDto {
    @NotNull private UUID collaboratorId; private UUID companyId; private UUID jobPositionId;
    private ContractTypeEnum contractType; @NotNull private LocalDate startDate; private LocalDate endDate;
    private BigDecimal baseSalary; private BigDecimal workloadHours; private String notes;
}
