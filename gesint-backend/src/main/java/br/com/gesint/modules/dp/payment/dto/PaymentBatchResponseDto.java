package br.com.gesint.modules.dp.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.payment.entity.PaymentBatchStatusEnum;
import br.com.gesint.modules.dp.payment.entity.PaymentBatchTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentBatchResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID paymentPeriodId;
    private PaymentBatchTypeEnum batchType;
    private String description;
    private UUID sourceObjectId;
    private PaymentBatchStatusEnum batchStatus;
    private Integer itemCount;
    private Integer divergentCount;
    private Integer sentCount;
    private Integer processingPage;
    private Integer totalPages;
    private OffsetDateTime processedAt;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
