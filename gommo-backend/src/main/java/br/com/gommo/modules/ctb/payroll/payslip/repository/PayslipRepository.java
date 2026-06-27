package br.com.gommo.modules.ctb.payroll.payslip.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.ctb.payroll.payslip.entity.Payslip;

@Repository
public interface PayslipRepository extends IBaseRepository<Payslip> {

    List<Payslip> findAllByPayrollRunIdAndStatusNot(UUID payrollRunId, StatusEnum status);

    Optional<Payslip> findByPayrollRunIdAndCollaboratorIdAndStatusNot(
            UUID payrollRunId, UUID collaboratorId, StatusEnum status);
}
