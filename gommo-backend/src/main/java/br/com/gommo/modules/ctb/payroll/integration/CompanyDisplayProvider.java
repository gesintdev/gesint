package br.com.gommo.modules.ctb.payroll.integration;

import java.util.Optional;
import java.util.UUID;

public interface CompanyDisplayProvider {

    Optional<CompanyDisplaySnapshot> findById(UUID companyId);

    Optional<CompanyDisplaySnapshot> findPrimary();
}
