package br.com.gommo.modules.dp.payment.dto;

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
public class PaymentBatchProcessResponseDto {

    private PaymentBatchResponseDto batch;
    private int processedCount;
    private int divergentCount;
}
