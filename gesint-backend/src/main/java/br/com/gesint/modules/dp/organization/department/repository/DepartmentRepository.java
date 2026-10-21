package br.com.gesint.modules.dp.organization.department.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gesint.core.base.repository.IBaseRepository;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.dp.organization.department.entity.Department;

@Repository
public interface DepartmentRepository extends IBaseRepository<Department> {

    @Query(
            """
            SELECT d FROM Department d
            WHERE d.status <> :deleted
              AND (:namePattern IS NULL OR LOWER(d.name) LIKE :namePattern)
              AND (:costCenterPattern IS NULL OR LOWER(d.costCenter) LIKE :costCenterPattern)
            """)
    Page<Department> search(
            @Param("deleted") StatusEnum deleted,
            @Param("namePattern") String namePattern,
            @Param("costCenterPattern") String costCenterPattern,
            Pageable pageable);

    @Query(
            """
            SELECT d FROM Department d
            WHERE d.status <> :deleted
              AND (
                   LOWER(FUNCTION('unaccent', d.name)) LIKE LOWER(FUNCTION('unaccent', :pattern))
                OR (d.costCenter IS NOT NULL AND LOWER(FUNCTION('unaccent', d.costCenter)) LIKE LOWER(FUNCTION('unaccent', :pattern)))
              )
            ORDER BY d.name ASC
            """)
    java.util.List<Department> searchForGlobal(
            @Param("deleted") StatusEnum deleted, @Param("pattern") String pattern, Pageable pageable);
}
