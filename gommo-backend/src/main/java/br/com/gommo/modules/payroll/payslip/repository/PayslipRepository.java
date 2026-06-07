package br.com.gommo.modules.payroll.payslip.repository;
import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.payroll.payslip.entity.Payslip;
import br.com.gommo.core.entity.StatusEnum;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
public interface PayslipRepository extends IBaseRepository<Payslip> {

    List<Payslip> findAllByPayrollRunIdAndStatusNot(UUID payrollRunId, StatusEnum status);

    Optional<Payslip> findByPayrollRunIdAndCollaboratorIdAndStatusNot(
            UUID payrollRunId, UUID collaboratorId, StatusEnum status);
}
