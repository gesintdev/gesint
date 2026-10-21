package br.com.gesint.modules.rh.person.contract.recess.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.contract.recess.entity.ContractRecessPeriod;

public interface ContractRecessPeriodRepository extends IBaseRepository<ContractRecessPeriod> {
    List<ContractRecessPeriod> findAllByCollaboratorIdAndStatusNotOrderByCycleStartDesc(
            UUID collaboratorId, StatusEnum status);

    Optional<ContractRecessPeriod> findByPolicyIdAndCycleStartAndStatusNot(
            UUID policyId, java.time.LocalDate cycleStart, StatusEnum status);
}
