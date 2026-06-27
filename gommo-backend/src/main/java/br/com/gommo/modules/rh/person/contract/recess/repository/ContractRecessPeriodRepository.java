package br.com.gommo.modules.rh.person.contract.recess.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.ContractRecessPeriod;

public interface ContractRecessPeriodRepository extends IBaseRepository<ContractRecessPeriod> {
    List<ContractRecessPeriod> findAllByCollaboratorIdAndStatusNotOrderByCycleStartDesc(
            UUID collaboratorId, StatusEnum status);

    Optional<ContractRecessPeriod> findByPolicyIdAndCycleStartAndStatusNot(
            UUID policyId, java.time.LocalDate cycleStart, StatusEnum status);
}
