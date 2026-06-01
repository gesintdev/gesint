package br.com.gommo.admin.modules.clientpayment.dto;

import br.com.gommo.admin.core.entity.StatusEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientPaymentResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private String referenceCode;
    private BigDecimal amount;
    private LocalDate dueDate;
    private OffsetDateTime paidAt;
    private String paymentStatus;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
