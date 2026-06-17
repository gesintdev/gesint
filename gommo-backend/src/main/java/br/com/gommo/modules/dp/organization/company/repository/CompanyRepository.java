package br.com.gommo.modules.dp.organization.company.repository;

import java.util.Optional;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.company.entity.Company;

@Repository
public interface CompanyRepository extends IBaseRepository<Company> {

    Optional<Company> findByCnpjAndStatusNot(String cnpj, StatusEnum status);
}
