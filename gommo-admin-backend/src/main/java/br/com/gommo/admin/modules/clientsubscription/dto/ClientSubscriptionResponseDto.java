package br.com.gommo.admin.modules.clientsubscription.dto;

import br.com.gommo.admin.core.entity.StatusEnum;
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
public class ClientSubscriptionResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private String planCode;
    private String billingStatus;
    private OffsetDateTime startedAt;
    private OffsetDateTime endsAt;
    private BigDecimal monthlyAmount;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
