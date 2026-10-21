package br.com.gesint.modules.rh.dashboard.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import br.com.gesint.core.branch.BranchContextHolder;
import br.com.gesint.core.branch.BranchScopedTables;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.entity.PayrollStatusEnum;

@Repository
public class DashboardMetricsDao {

    private static final String TIME_ZONE = "America/Sao_Paulo";
    private static final String STATUS_NOT_DELETED = "status <> CAST(:deleted AS status_enum)";
    private static final String BRANCH_SCOPE = " AND company_id = :branchId";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * SQL nativo nao passa pelo filtro de filial do Hibernate: aqui o escopo e explicito.
     * Todas as tabelas usadas neste DAO sao escopadas por filial.
     */
    private static String notDeletedInBranch() {
        return BranchContextHolder.isUnscoped() ? STATUS_NOT_DELETED : STATUS_NOT_DELETED + BRANCH_SCOPE;
    }

    public long countActiveCollaborators() {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM collaborator
                WHERE status = CAST(:active AS status_enum)%s
                """
                        .formatted(BranchContextHolder.isUnscoped() ? "" : BRANCH_SCOPE),
                Map.of("active", StatusEnum.ACTIVE.name()));
    }

    public long countCollaboratorsCreatedSince(OffsetDateTime since) {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM collaborator
                WHERE %s
                  AND created_at >= :since
                """
                        .formatted(notDeletedInBranch()),
                Map.of("deleted", StatusEnum.DELETED.name(), "since", since));
    }

    public long countActiveContracts(LocalDate today) {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM employment_contract
                WHERE %s
                  AND (end_date IS NULL OR end_date >= :today)
                """
                        .formatted(notDeletedInBranch()),
                Map.of("deleted", StatusEnum.DELETED.name(), "today", today));
    }

    public long countOpenPayrollRuns(LocalDate referenceDate) {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM payroll_run
                WHERE %s
                  AND payroll_status IN (
                      CAST(:open AS payroll_status_enum),
                      CAST(:processing AS payroll_status_enum)
                  )
                  AND reference_date = :referenceDate
                """
                        .formatted(notDeletedInBranch()),
                Map.of(
                        "deleted", StatusEnum.DELETED.name(),
                        "open", PayrollStatusEnum.OPEN.name(),
                        "processing", PayrollStatusEnum.PROCESSING.name(),
                        "referenceDate", referenceDate));
    }

    public long countPendingLeaveRequests() {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM leave_request
                WHERE %s
                  AND approved = FALSE
                """
                        .formatted(notDeletedInBranch()),
                Map.of("deleted", StatusEnum.DELETED.name()));
    }

    public Map<LocalDate, Long> countMovementSince(OffsetDateTime since) {
        String sql =
                """
                        SELECT day, SUM(total) AS total
                        FROM (
                            SELECT CAST(created_at AT TIME ZONE '%s' AS date) AS day, COUNT(*) AS total
                            FROM collaborator
                            WHERE %s AND created_at >= :since
                            GROUP BY 1
                            UNION ALL
                            SELECT CAST(created_at AT TIME ZONE '%s' AS date), COUNT(*)
                            FROM admission_process
                            WHERE %s AND created_at >= :since
                            GROUP BY 1
                            UNION ALL
                            SELECT CAST(created_at AT TIME ZONE '%s' AS date), COUNT(*)
                            FROM employment_contract
                            WHERE %s AND created_at >= :since
                            GROUP BY 1
                            UNION ALL
                            SELECT CAST(created_at AT TIME ZONE '%s' AS date), COUNT(*)
                            FROM attendance_record
                            WHERE %s AND created_at >= :since
                            GROUP BY 1
                        ) movement
                        GROUP BY day
                        ORDER BY day
                        """
                        .formatted(
                                TIME_ZONE,
                                notDeletedInBranch(),
                                TIME_ZONE,
                                notDeletedInBranch(),
                                TIME_ZONE,
                                notDeletedInBranch(),
                                TIME_ZONE,
                                notDeletedInBranch());

        var query = entityManager
                .createNativeQuery(sql)
                .setParameter("deleted", StatusEnum.DELETED.name())
                .setParameter("since", since);
        bindBranch(query, sql);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        Map<LocalDate, Long> totals = new HashMap<>();
        for (Object[] row : rows) {
            LocalDate day = toLocalDate(row[0]);
            long total = ((Number) row[1]).longValue();
            totals.put(day, total);
        }
        return totals;
    }

    public Map<String, Long> countAdmissionsByStatus() {
        List<Object[]> rows = groupedCount(
                """
                SELECT admission_status, COUNT(*)
                FROM admission_process
                WHERE %s
                GROUP BY admission_status
                """);

        Map<String, Long> totals = new HashMap<>();
        for (Object[] row : rows) {
            totals.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }
        return totals;
    }

    public Map<String, Long> countLeaveByType() {
        List<Object[]> rows = groupedCount(
                """
                SELECT leave_type, COUNT(*)
                FROM leave_request
                WHERE %s
                GROUP BY leave_type
                """);

        Map<String, Long> totals = new HashMap<>();
        for (Object[] row : rows) {
            totals.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }
        return totals;
    }

    public long countModuleRecords(String tableName) {
        return countWhere(
                """
                SELECT COUNT(*)
                FROM %s
                WHERE %s
                """
                        .formatted(tableName, BranchScopedTables.isScoped(tableName) ? notDeletedInBranch() : STATUS_NOT_DELETED),
                Map.of("deleted", StatusEnum.DELETED.name()));
    }

    /** @param sqlTemplate com um unico {@code %s} para o predicado de status e filial. */
    private List<Object[]> groupedCount(String sqlTemplate) {
        String sql = sqlTemplate.formatted(notDeletedInBranch());
        var query = entityManager.createNativeQuery(sql).setParameter("deleted", StatusEnum.DELETED.name());
        bindBranch(query, sql);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows;
    }

    private long countWhere(String sql, Map<String, Object> params) {
        var query = entityManager.createNativeQuery(sql);
        params.forEach(query::setParameter);
        bindBranch(query, sql);
        return ((Number) query.getSingleResult()).longValue();
    }

    private void bindBranch(jakarta.persistence.Query query, String sql) {
        if (sql.contains(":branchId")) {
            query.setParameter("branchId", BranchContextHolder.require());
        }
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof java.sql.Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        return LocalDate.parse(String.valueOf(value));
    }
}
