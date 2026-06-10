package br.com.gommo.admin.modules.dashboard.repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DashboardMetricsDao {

    private final JdbcTemplate jdbcTemplate;

    public DashboardMetricsDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long countActiveClients() {
        return count("SELECT COUNT(*) FROM admin.client WHERE status <> 'DELETED'");
    }

    public long countClientsCreatedSince(OffsetDateTime since) {
        return count("SELECT COUNT(*) FROM admin.client WHERE status <> 'DELETED' AND created_at >= ?", since);
    }

    public long countReadyTenants() {
        return count("SELECT COUNT(*) FROM admin.client WHERE status <> 'DELETED' AND provisioning_status = 'READY'");
    }

    public long countPendingProvisioning() {
        return count(
                """
                SELECT COUNT(*) FROM admin.client
                WHERE status <> 'DELETED'
                  AND provisioning_status IN ('PENDING', 'PROVISIONING', 'ERROR')
                """);
    }

    public long countActiveSubscriptions() {
        return count(
                """
                SELECT COUNT(*) FROM admin.client_subscription
                WHERE status <> 'DELETED' AND billing_status = 'ACTIVE'
                """);
    }

    public long countActiveClientUsers() {
        return count("SELECT COUNT(*) FROM admin.client_user WHERE status <> 'DELETED'");
    }

    public long countPendingPayments() {
        return count(
                """
                SELECT COUNT(*) FROM admin.client_payment
                WHERE status <> 'DELETED' AND payment_status = 'PENDING'
                """);
    }

    public long countTableRecords(String tableName) {
        return count("SELECT COUNT(*) FROM admin." + tableName + " WHERE status <> 'DELETED'");
    }

    public Map<LocalDate, Long> countClientsCreatedPerDaySince(OffsetDateTime since) {
        return jdbcTemplate.query(
                """
                SELECT DATE(created_at AT TIME ZONE 'America/Sao_Paulo') AS day, COUNT(*) AS total
                FROM admin.client
                WHERE status <> 'DELETED' AND created_at >= ?
                GROUP BY day
                ORDER BY day
                """,
                rs -> {
                    Map<LocalDate, Long> result = new HashMap<>();
                    while (rs.next()) {
                        result.put(rs.getObject("day", LocalDate.class), rs.getLong("total"));
                    }
                    return result;
                },
                since);
    }

    public Map<String, Long> countClientsByProvisioningStatus() {
        return jdbcTemplate.query(
                """
                SELECT provisioning_status AS key, COUNT(*) AS total
                FROM admin.client
                WHERE status <> 'DELETED'
                GROUP BY provisioning_status
                ORDER BY provisioning_status
                """,
                rs -> {
                    Map<String, Long> result = new HashMap<>();
                    while (rs.next()) {
                        result.put(rs.getString("key"), rs.getLong("total"));
                    }
                    return result;
                });
    }

    public Map<String, Long> countSubscriptionsByPlan() {
        return jdbcTemplate.query(
                """
                SELECT plan_code AS key, COUNT(*) AS total
                FROM admin.client_subscription
                WHERE status <> 'DELETED'
                GROUP BY plan_code
                ORDER BY plan_code
                """,
                rs -> {
                    Map<String, Long> result = new HashMap<>();
                    while (rs.next()) {
                        result.put(rs.getString("key"), rs.getLong("total"));
                    }
                    return result;
                });
    }

    private long count(String sql, Object... args) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class, args);
        return value != null ? value : 0L;
    }
}
