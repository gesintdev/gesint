package br.com.gesint.modules.ctb.payroll.payslip.entry.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.payslip.entry.entity.PayslipEntry;

@Repository
public interface PayslipEntryRepository extends IBaseRepository<PayslipEntry> {

    List<PayslipEntry> findAllByPayslipIdAndStatusNot(UUID payslipId, StatusEnum status);
}
