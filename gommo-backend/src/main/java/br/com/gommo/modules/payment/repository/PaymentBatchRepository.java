package br.com.gommo.modules.payment.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payment.entity.PaymentBatch;
import java.util.List;
import java.util.UUID;

public interface PaymentBatchRepository extends IBaseRepository<PaymentBatch> {

    List<PaymentBatch> findByPaymentPeriodIdAndStatusNotOrderByCreatedAtDesc(UUID paymentPeriodId, StatusEnum status);

    boolean existsByPaymentPeriodIdAndSourceFileNameIgnoreCaseAndStatusNot(
            UUID paymentPeriodId, String sourceFileName, StatusEnum status);
}
