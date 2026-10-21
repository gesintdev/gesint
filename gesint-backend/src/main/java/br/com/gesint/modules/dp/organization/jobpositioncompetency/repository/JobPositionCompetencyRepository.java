package br.com.gesint.modules.dp.organization.jobpositioncompetency.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetency;

@Repository
public interface JobPositionCompetencyRepository extends IBaseRepository<JobPositionCompetency> {

    @Query(
            """
            SELECT COALESCE(MAX(e.versionNumber), 0) FROM JobPositionCompetency e
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
              AND e.competencyId = :competencyId
            """)
    Integer findMaxVersionNumber(
            @Param("jobPositionId") UUID jobPositionId,
            @Param("competencyId") UUID competencyId,
            @Param("deletedStatus") StatusEnum deletedStatus);

    List<JobPositionCompetency> findByJobPositionIdAndCompetencyIdAndValidUntilIsNullAndStatusNot(
            UUID jobPositionId, UUID competencyId, StatusEnum status);

    @Query(
            """
            SELECT e FROM JobPositionCompetency e
            WHERE e.status <> :deletedStatus
              AND e.jobPositionId = :jobPositionId
            ORDER BY e.validFrom DESC, e.versionNumber DESC
            """)
    List<JobPositionCompetency> findByJobPositionIdOrdered(
            @Param("jobPositionId") UUID jobPositionId, @Param("deletedStatus") StatusEnum deletedStatus);
}
