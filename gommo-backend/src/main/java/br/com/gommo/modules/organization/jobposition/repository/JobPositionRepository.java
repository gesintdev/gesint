package br.com.gommo.modules.organization.jobposition.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.organization.jobposition.entity.JobPosition;

@Repository
public interface JobPositionRepository extends IBaseRepository<JobPosition> {

    @Query(
            """
            SELECT j FROM JobPosition j
            WHERE j.status <> :deleted
              AND (:titlePattern IS NULL OR LOWER(j.title) LIKE :titlePattern)
              AND (:cboCodePattern IS NULL OR LOWER(j.cboCode) LIKE :cboCodePattern)
              AND (:departmentId IS NULL OR j.departmentId IS NULL OR j.departmentId = :departmentId)
            """)
    Page<JobPosition> search(
            @Param("deleted") StatusEnum deleted,
            @Param("titlePattern") String titlePattern,
            @Param("cboCodePattern") String cboCodePattern,
            @Param("departmentId") UUID departmentId,
            Pageable pageable);
}
