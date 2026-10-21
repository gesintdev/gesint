package br.com.gesint.modules.dp.organization.jobpositionsalarytable.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobpositionsalarytable.entity.JobPositionSalaryTable;

@Repository
public interface JobPositionSalaryTableRepository extends IBaseRepository<JobPositionSalaryTable> {

    @Query(
            """
            SELECT COALESCE(MAX(e.versionNumber), 0) FROM JobPositionSalaryTable e
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
            """)
    Integer findMaxVersionNumber(
            @Param("jobPositionId") UUID jobPositionId, @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT DISTINCT e FROM JobPositionSalaryTable e
            LEFT JOIN FETCH e.items
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
            ORDER BY e.validFrom DESC, e.versionNumber DESC
            """)
    List<JobPositionSalaryTable> findByJobPositionIdOrdered(
            @Param("jobPositionId") UUID jobPositionId, @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT DISTINCT e FROM JobPositionSalaryTable e
            LEFT JOIN FETCH e.items
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
              AND e.validUntil IS NULL
            ORDER BY e.versionNumber DESC
            """)
    List<JobPositionSalaryTable> findCurrentByJobPositionIdWithItems(
            @Param("jobPositionId") UUID jobPositionId, @Param("deletedStatus") StatusEnum deletedStatus);

    @Query(
            """
            SELECT e FROM JobPositionSalaryTable e
            LEFT JOIN FETCH e.items
            WHERE e.id = :id
              AND e.status <> :deletedStatus
            """)
    Optional<JobPositionSalaryTable> findByIdWithItems(
            @Param("id") UUID id, @Param("deletedStatus") StatusEnum deletedStatus);
}
