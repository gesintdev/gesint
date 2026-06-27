package br.com.gommo.modules.dp.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.payment.entity.PaymentSlipStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSlipResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID paymentBatchId;
    private UUID collaboratorId;
    private String collaboratorName;
    private String collaboratorNameDisplay;
    private String extractedName;
    private String extractedNameDisplay;
    private UUID slipObjectId;
    private PaymentSlipStatusEnum slipStatus;
    private Integer pageNumber;
    private String collaboratorEmail;
    private String collaboratorPhone;
    private OffsetDateTime processedAt;
    private OffsetDateTime sentAt;
    private OffsetDateTime emailSentAt;
    private OffsetDateTime whatsappSentAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
