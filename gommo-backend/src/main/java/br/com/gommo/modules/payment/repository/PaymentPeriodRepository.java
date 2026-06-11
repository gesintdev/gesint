package br.com.gommo.modules.payment.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payment.entity.PaymentPeriod;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface PaymentPeriodRepository extends IBaseRepository<PaymentPeriod> {

    Optional<PaymentPeriod> findByReferenceDateAndStatusNot(LocalDate referenceDate, StatusEnum status);
}
