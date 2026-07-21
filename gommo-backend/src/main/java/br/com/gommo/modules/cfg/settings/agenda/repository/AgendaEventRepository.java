package br.com.gommo.modules.cfg.settings.agenda.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.agenda.entity.AgendaEvent;

@Repository
public interface AgendaEventRepository extends IBaseRepository<AgendaEvent> {

    @Query(
            """
            SELECT e FROM AgendaEvent e
            WHERE e.ownerUserId = :ownerUserId
              AND e.status <> :deleted
              AND e.startsAt < :to
              AND e.endsAt > :from
            ORDER BY e.startsAt ASC
            """)
    List<AgendaEvent> findOwnedInRange(
            @Param("ownerUserId") UUID ownerUserId,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            @Param("deleted") StatusEnum deleted);

    Optional<AgendaEvent> findByIdAndOwnerUserIdAndStatusNot(UUID id, UUID ownerUserId, StatusEnum status);
}
