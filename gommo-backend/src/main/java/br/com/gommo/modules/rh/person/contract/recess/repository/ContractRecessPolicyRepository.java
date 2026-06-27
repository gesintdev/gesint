package br.com.gommo.modules.rh.person.contract.recess.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.contract.recess.entity.ContractRecessPolicy;

public interface ContractRecessPolicyRepository extends IBaseRepository<ContractRecessPolicy> {
    @Query(
            """
            select p from ContractRecessPolicy p
            where p.employmentContractId = :contractId and p.status <> :deletedStatus
              and p.effectiveFrom <= :date and (p.effectiveUntil is null or p.effectiveUntil >= :date)
            order by p.effectiveFrom desc
            limit 1
            """)
    Optional<ContractRecessPolicy> findEffective(
            @Param("contractId") UUID contractId,
            @Param("date") LocalDate date,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
