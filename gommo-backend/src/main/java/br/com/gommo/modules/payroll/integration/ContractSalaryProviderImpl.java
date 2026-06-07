package br.com.gommo.modules.payroll.integration;

import br.com.gommo.modules.person.contract.entity.EmploymentContract;
import br.com.gommo.modules.person.contract.repository.EmploymentContractRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class ContractSalaryProviderImpl implements ContractSalaryProvider {

    private static final BigDecimal DEFAULT_WEEKLY_HOURS = new BigDecimal("44.00");

    private final EmploymentContractRepository contractRepository;

    public ContractSalaryProviderImpl(EmploymentContractRepository contractRepository) {
        this.contractRepository = contractRepository;
    }

    @Override
    public List<ContractSalarySnapshot> findActiveContracts(
            UUID companyId, LocalDate periodStart, LocalDate periodEnd) {
        List<EmploymentContract> contracts =
                contractRepository.findActiveForPeriod(companyId, periodStart, periodEnd);

        Map<UUID, ContractSalarySnapshot> latestByCollaborator = new LinkedHashMap<>();
        for (EmploymentContract contract : contracts) {
            latestByCollaborator.putIfAbsent(
                    contract.getCollaboratorId(),
                    new ContractSalarySnapshot(
                            contract.getCollaboratorId(),
                            contract.getCompanyId(),
                            contract.getBaseSalary() != null ? contract.getBaseSalary() : BigDecimal.ZERO,
                            contract.getWorkloadHours() != null ? contract.getWorkloadHours() : DEFAULT_WEEKLY_HOURS));
        }
        return new ArrayList<>(latestByCollaborator.values());
    }
}
