package br.com.gommo.modules.dp.organization.jobposition.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPosition;
import br.com.gommo.modules.dp.organization.jobposition.entity.JobPositionNatureEnum;

@Repository
public interface JobPositionRepository extends IBaseRepository<JobPosition> {

    @Query(
            """
            SELECT j FROM JobPosition j
            WHERE j.status <> :deleted
              AND (:titlePattern IS NULL OR LOWER(j.title) LIKE :titlePattern)
              AND (:cboCodePattern IS NULL OR LOWER(j.cboCode) LIKE :cboCodePattern)
              AND (:departmentId IS NULL OR j.departmentId IS NULL OR j.departmentId = :departmentId)
              AND (:nature IS NULL OR j.nature = :nature)
            """)
    Page<JobPosition> search(
            @Param("deleted") StatusEnum deleted,
            @Param("titlePattern") String titlePattern,
            @Param("cboCodePattern") String cboCodePattern,
            @Param("departmentId") UUID departmentId,
            @Param("nature") JobPositionNatureEnum nature,
            Pageable pageable);

    @Query(
            """
            SELECT j FROM JobPosition j
            WHERE j.status <> :deleted
              AND (
                   LOWER(FUNCTION('unaccent', j.title)) LIKE LOWER(FUNCTION('unaccent', :pattern))
                OR (j.cboCode IS NOT NULL AND LOWER(j.cboCode) LIKE LOWER(:pattern))
              )
            ORDER BY j.title ASC
            """)
    java.util.List<JobPosition> searchForGlobal(
            @Param("deleted") StatusEnum deleted, @Param("pattern") String pattern, Pageable pageable);
}
