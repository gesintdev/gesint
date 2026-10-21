package br.com.gesint.modules.ctb.payroll.event.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.event.entity.PayrollEvent;

@Repository
public interface PayrollEventRepository extends IBaseRepository<PayrollEvent> {

    Optional<PayrollEvent> findByEventCodeAndStatusNot(String eventCode, StatusEnum status);
}
