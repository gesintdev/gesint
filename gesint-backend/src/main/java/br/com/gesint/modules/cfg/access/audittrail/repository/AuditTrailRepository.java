package br.com.gesint.modules.cfg.access.audittrail.repository;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.gesint.core.audit.trail.AuditCategoryEnum;
import br.com.gesint.core.audit.trail.AuditLog;

public interface AuditTrailRepository extends JpaRepository<AuditLog, UUID> {

    @Query(
            value = """
                    SELECT new br.com.gesint.modules.cfg.access.audittrail.repository.AuditTrailRow(a, u.username, u.name)
                    FROM AuditLog a
                    LEFT JOIN AppUser u ON u.id = a.userId
                    WHERE a.occurredAt >= :from
                      AND (:category IS NULL OR a.category = :category)
                      AND (:pattern IS NULL
                           OR LOWER(COALESCE(u.username, '')) LIKE :pattern
                           OR LOWER(COALESCE(u.name, '')) LIKE :pattern
                           OR LOWER(COALESCE(a.recordLabel, '')) LIKE :pattern
                           OR LOWER(COALESCE(a.detail, '')) LIKE :pattern)
                    ORDER BY a.occurredAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(a)
                    FROM AuditLog a
                    LEFT JOIN AppUser u ON u.id = a.userId
                    WHERE a.occurredAt >= :from
                      AND (:category IS NULL OR a.category = :category)
                      AND (:pattern IS NULL
                           OR LOWER(COALESCE(u.username, '')) LIKE :pattern
                           OR LOWER(COALESCE(u.name, '')) LIKE :pattern
                           OR LOWER(COALESCE(a.recordLabel, '')) LIKE :pattern
                           OR LOWER(COALESCE(a.detail, '')) LIKE :pattern)
                    """)
    Page<AuditTrailRow> search(
            @Param("from") Instant from,
            @Param("category") AuditCategoryEnum category,
            @Param("pattern") String pattern,
            Pageable pageable);
}
