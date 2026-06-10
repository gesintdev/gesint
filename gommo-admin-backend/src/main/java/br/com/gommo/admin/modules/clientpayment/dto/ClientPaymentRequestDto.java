package br.com.gommo.admin.modules.clientpayment.dto;

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
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientPaymentRequestDto {

    @NotNull private UUID clientId;

    @Size(max = 100) private String referenceCode;

    @NotNull private BigDecimal amount;

    @NotNull private LocalDate dueDate;

    private OffsetDateTime paidAt;

    @NotBlank @Size(max = 32) private String paymentStatus;

    private String notes;
}
