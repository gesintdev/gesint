package br.com.gesint.modules.dp.payment.repository;

import java.util.List;
import java.util.UUID;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.payment.entity.PaymentBatch;

public interface PaymentBatchRepository extends IBaseRepository<PaymentBatch> {

    List<PaymentBatch> findByPaymentPeriodIdAndStatusNotOrderByCreatedAtDesc(UUID paymentPeriodId, StatusEnum status);

    boolean existsByPaymentPeriodIdAndSourceFileNameIgnoreCaseAndStatusNot(
            UUID paymentPeriodId, String sourceFileName, StatusEnum status);
}
