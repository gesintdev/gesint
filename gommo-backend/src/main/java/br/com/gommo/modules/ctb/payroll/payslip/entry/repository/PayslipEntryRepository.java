package br.com.gommo.modules.ctb.payroll.payslip.entry.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.entity.StatusEnum;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface PayslipEntryRepository extends IBaseRepository<PayslipEntry> {

    List<PayslipEntry> findAllByPayslipIdAndStatusNot(UUID payslipId, StatusEnum status);
}
