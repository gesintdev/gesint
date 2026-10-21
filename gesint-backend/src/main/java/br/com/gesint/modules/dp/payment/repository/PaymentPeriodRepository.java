package br.com.gesint.modules.dp.payment.repository;

import java.time.LocalDate;
import java.util.Optional;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.payment.entity.PaymentPeriod;

public interface PaymentPeriodRepository extends IBaseRepository<PaymentPeriod> {

    Optional<PaymentPeriod> findByReferenceDateAndStatusNot(LocalDate referenceDate, StatusEnum status);
}
