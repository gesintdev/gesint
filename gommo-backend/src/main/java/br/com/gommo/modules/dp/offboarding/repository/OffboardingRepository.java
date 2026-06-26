package br.com.gommo.modules.dp.offboarding.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.Offboarding;

@Repository
public interface OffboardingRepository extends IBaseRepository<Offboarding> {

    @Query(
            """
            SELECT DISTINCT o.collaboratorId FROM Offboarding o
            WHERE o.collaboratorId IS NOT NULL
              AND o.status <> :deleted
            """)
    List<UUID> findOffboardedCollaboratorIds(@Param("deleted") StatusEnum deleted);

    @Query(
            """
            SELECT DISTINCT o.collaboratorId FROM Offboarding o
            WHERE o.collaboratorId IN :collaboratorIds
              AND o.status <> :deleted
            """)
    List<UUID> findOffboardedCollaboratorIdsIn(
            @Param("collaboratorIds") List<UUID> collaboratorIds, @Param("deleted") StatusEnum deleted);

    boolean existsByCollaboratorIdAndStatusNot(UUID collaboratorId, StatusEnum status);
}
