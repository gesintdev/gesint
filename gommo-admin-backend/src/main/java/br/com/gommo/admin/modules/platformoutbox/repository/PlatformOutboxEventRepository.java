package br.com.gommo.admin.modules.platformoutbox.repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gommo.admin.modules.platformoutbox.entity.OutboxEventStatusEnum;
import br.com.gommo.admin.modules.platformoutbox.entity.PlatformOutboxEvent;

public interface PlatformOutboxEventRepository extends JpaRepository<PlatformOutboxEvent, UUID> {

    @Query(
            """
            SELECT e FROM PlatformOutboxEvent e
            WHERE e.status = :status
              AND e.availableAt <= :now
            ORDER BY e.createdAt ASC
            """)
    List<PlatformOutboxEvent> findDispatchBatch(
            @Param("status") OutboxEventStatusEnum status, @Param("now") OffsetDateTime now);
}
