package br.com.gesint.modules.dp.payment.service;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.dp.payment.dto.PaymentBatchProcessResponseDto;
import br.com.gesint.modules.dp.payment.dto.PaymentBatchResponseDto;
import br.com.gesint.modules.dp.payment.dto.PaymentSlipSendResponseDto;
import br.com.gesint.modules.dp.payment.entity.PaymentSlipStatusEnum;

public interface IPaymentBatchService {

    List<PaymentBatchResponseDto> findByPeriod(UUID periodId);

    PaymentBatchProcessResponseDto uploadAndProcess(UUID periodId, MultipartFile file, String description);

    void delete(UUID batchId);

    List<br.com.gesint.modules.dp.payment.dto.PaymentSlipResponseDto> findSlips(
            UUID batchId, PaymentSlipStatusEnum status);

    PaymentSlipSendResponseDto sendEmail(UUID slipId);

    PaymentSlipSendResponseDto sendWhatsapp(UUID slipId);

    int sendAllProcessed(UUID batchId);

    br.com.gesint.modules.dp.payment.dto.PaymentSlipResponseDto validateSlip(UUID slipId);
}
