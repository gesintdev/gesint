package br.com.gommo.modules.ctb.payroll.event.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEvent;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.entity.StatusEnum;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface PayrollEventRepository extends IBaseRepository<PayrollEvent> {

    Optional<PayrollEvent> findByEventCodeAndStatusNot(String eventCode, StatusEnum status);
}
