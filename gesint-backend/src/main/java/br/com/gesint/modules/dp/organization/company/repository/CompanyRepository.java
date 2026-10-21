package br.com.gesint.modules.dp.organization.company.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.company.entity.Company;

@Repository
public interface CompanyRepository extends IBaseRepository<Company> {

    Optional<Company> findByCnpjAndStatusNot(String cnpj, StatusEnum status);

    Optional<Company> findByHeadquartersTrueAndStatusNot(StatusEnum status);

    List<Company> findAllByStatusNotOrderBySortOrderAscLegalNameAsc(StatusEnum status);

    List<Company> findAllByParentIdAndStatusNot(UUID parentId, StatusEnum status);

    boolean existsByParentIdAndStatusNot(UUID parentId, StatusEnum status);
}
