package br.com.gommo.modules.ctb.payroll.integration;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ContractSalaryProvider {

    List<ContractSalarySnapshot> findActiveContracts(UUID companyId, LocalDate periodStart, LocalDate periodEnd);
}
