package br.com.gommo.admin.modules.clientcontractedsystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContractedSystemRequestDto {

    @NotNull private UUID clientId;

    @NotNull private UUID productSystemId;

    @Size(max = 32) private String operationalStatus;

    private LocalDate statusDate;
    private LocalDate returnDate;
    private BigDecimal negotiatedAmount;
    private BigDecimal discountPercent;
    private BigDecimal agreedAmount;

    @Size(max = 32) private String contractType;

    private LocalDate contractDate;
    private LocalDate endDate;

    @Size(max = 2) private String dueDay;

    @Size(max = 50) private String lateTolerance;

    private Boolean withAi;

    private OffsetDateTime effectiveFrom;

    private OffsetDateTime deactivateAt;

    @Size(max = 32) private String sessionPolicy;

    /** {@code ALL} ou {@code SELECTED}. Ausente significa {@code ALL}. */
    @Size(max = 16) private String branchMode;

    /** Usados apenas quando {@code branchMode = SELECTED}. A matriz vem separada por nao ter id de filial. */
    private Boolean includeHeadquarters;

    private List<UUID> clientBranchIds;

    private String notes;
}
