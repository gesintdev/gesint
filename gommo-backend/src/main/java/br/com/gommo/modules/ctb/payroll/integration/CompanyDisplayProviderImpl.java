package br.com.gommo.modules.ctb.payroll.integration;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import br.com.gommo.core.branch.BranchContextHolder;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.company.entity.Company;
import br.com.gommo.modules.dp.organization.company.repository.CompanyRepository;

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

    /**
     * Empresa que assina os documentos: a filial ativa.
     *
     * Holerite, remessa bancaria, AFD do ponto e eventos do eSocial sao todos por estabelecimento,
     * entao emitir com o CNPJ de outra unidade produz documento legalmente errado. Sem filial
     * ativa, cai na matriz.
     */
    @Override
    public Optional<CompanyDisplaySnapshot> findPrimary() {
        Optional<CompanyDisplaySnapshot> activeBranch = BranchContextHolder.getOptional()
                .flatMap(branchId -> companyRepository.findByIdAndStatusNot(branchId, StatusEnum.DELETED))
                .map(this::toSnapshot);
        if (activeBranch.isPresent()) {
            return activeBranch;
        }
        return companyRepository
                .findByHeadquartersTrueAndStatusNot(StatusEnum.DELETED)
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
