package br.com.gommo.admin.modules.clientsubscription.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
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
public class ClientSubscriptionRequestDto {

    @NotNull
    private UUID clientId;

    @NotBlank
    @Size(max = 50)
    private String planCode;

    @NotBlank
    @Size(max = 32)
    private String billingStatus;

    private OffsetDateTime startedAt;
    private OffsetDateTime endsAt;
    private BigDecimal monthlyAmount;
    private String notes;
}
