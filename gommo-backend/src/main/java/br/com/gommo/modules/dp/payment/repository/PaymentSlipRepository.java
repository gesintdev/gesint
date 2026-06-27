package br.com.gommo.modules.dp.payment.repository;

import java.util.List;
import java.util.UUID;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.payment.entity.PaymentSlip;
import br.com.gommo.modules.dp.payment.entity.PaymentSlipStatusEnum;

public interface PaymentSlipRepository extends IBaseRepository<PaymentSlip> {

    List<PaymentSlip> findByPaymentBatchIdAndStatusNotOrderByExtractedNameAsc(UUID paymentBatchId, StatusEnum status);

    List<PaymentSlip> findByPaymentBatchIdAndSlipStatusAndStatusNotOrderByExtractedNameAsc(
            UUID paymentBatchId, PaymentSlipStatusEnum slipStatus, StatusEnum status);

    long countByPaymentBatchIdAndSlipStatusAndStatusNot(
            UUID paymentBatchId, PaymentSlipStatusEnum slipStatus, StatusEnum status);
}
