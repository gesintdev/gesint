package br.com.gommo.modules.person.contract.repository;

import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.modules.person.contract.entity.EmploymentContract;

@Repository
public interface EmploymentContractRepository extends IBaseRepository<EmploymentContract> {}
