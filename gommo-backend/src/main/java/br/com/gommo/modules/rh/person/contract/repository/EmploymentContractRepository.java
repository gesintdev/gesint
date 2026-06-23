package br.com.gommo.modules.rh.person.contract.repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.contract.entity.EmploymentContract;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmploymentContractRepository extends IBaseRepository<EmploymentContract> {
    java.util.Optional<EmploymentContract> findFirstByCollaboratorIdAndStatusNotOrderByStartDateDesc(
            UUID collaboratorId, StatusEnum status);

    @Query("""
            SELECT c FROM EmploymentContract c
            WHERE c.status <> :deletedStatus
              AND c.startDate <= :periodEnd
              AND (c.endDate IS NULL OR c.endDate >= :periodStart)
              AND (:companyId IS NULL OR c.companyId = :companyId)
            ORDER BY c.startDate DESC
            """)
    List<EmploymentContract> findActiveForPeriod(
            @Param("companyId") UUID companyId,
            @Param("periodStart") LocalDate periodStart,
            @Param("periodEnd") LocalDate periodEnd,
            @Param("deletedStatus") StatusEnum deletedStatus);
}
