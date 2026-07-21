package br.com.gommo.modules.dp.organization.workschedule.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.workschedule.entity.WorkSchedule;

@Repository
public interface WorkScheduleRepository extends IBaseRepository<WorkSchedule> {

    List<WorkSchedule> findByStatusOrderByNameAsc(StatusEnum status);

    @Query(
            """
            SELECT DISTINCT w FROM WorkSchedule w
            LEFT JOIN FETCH w.days
            WHERE w.id = :id AND w.status <> :deleted
            """)
    Optional<WorkSchedule> findByIdWithDays(@Param("id") UUID id, @Param("deleted") StatusEnum deleted);

    @Query(
            """
            SELECT w FROM WorkSchedule w
            WHERE w.status <> :deleted
              AND (:namePattern IS NULL OR LOWER(w.name) LIKE :namePattern)
            ORDER BY w.name ASC
            """)
    Page<WorkSchedule> search(
            @Param("deleted") StatusEnum deleted, @Param("namePattern") String namePattern, Pageable pageable);
}
