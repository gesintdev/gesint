package br.com.gommo.admin.modules.clientcontractedsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientContractedSystemResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private UUID productSystemId;
    private String productSystemKey;
    private String name;
    private String moduleName;
    private String operationalStatus;
    private LocalDate statusDate;
    private LocalDate returnDate;
    private BigDecimal negotiatedAmount;
    private BigDecimal discountPercent;
    private BigDecimal agreedAmount;
    private String contractType;
    private LocalDate contractDate;
    private LocalDate endDate;
    private String dueDay;
    private String lateTolerance;
    private boolean withAi;
    private OffsetDateTime effectiveFrom;
    private OffsetDateTime deactivateAt;
    private String sessionPolicy;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
