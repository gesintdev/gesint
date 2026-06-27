package br.com.gommo.modules.dp.payment.repository;

import java.time.LocalDate;
import java.util.Optional;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.payment.entity.PaymentPeriod;

public interface PaymentPeriodRepository extends IBaseRepository<PaymentPeriod> {

    Optional<PaymentPeriod> findByReferenceDateAndStatusNot(LocalDate referenceDate, StatusEnum status);
}
