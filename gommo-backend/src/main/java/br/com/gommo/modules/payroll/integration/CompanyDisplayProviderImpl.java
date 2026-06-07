package br.com.gommo.modules.payroll.integration;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.company.entity.Company;
import br.com.gommo.modules.company.repository.CompanyRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class CompanyDisplayProviderImpl implements CompanyDisplayProvider {

    private final CompanyRepository companyRepository;

    public CompanyDisplayProviderImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public Optional<CompanyDisplaySnapshot> findById(UUID companyId) {
        if (companyId == null) {
            return Optional.empty();
        }
        return companyRepository
                .findByIdAndStatusNot(companyId, StatusEnum.DELETED)
                .map(this::toSnapshot);
    }

    private CompanyDisplaySnapshot toSnapshot(Company company) {
        return new CompanyDisplaySnapshot(
                company.getId(),
                company.getLegalName(),
                company.getTradeName(),
                company.getCnpj(),
                company.getCity(),
                company.getStateCode());
    }
}
