package br.com.gommo.core.tenant;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcAdminClientLookup implements AdminClientLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcAdminClientLookup.class);

    private static final String BASE_SELECT =
            """
            SELECT c.id, c.slug, c.name, c.database_schema, c.provisioning_status,
                   sub.billing_status
            FROM admin.client c
            LEFT JOIN LATERAL (
                SELECT s.billing_status
                FROM admin.client_subscription s
                WHERE s.client_id = c.id
                  AND s.status <> 'DELETED'
                ORDER BY
                    CASE WHEN s.billing_status = 'ACTIVE' THEN 0 ELSE 1 END,
                    s.created_at DESC
                LIMIT 1
            ) sub ON TRUE
            WHERE c.status <> 'DELETED'
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcAdminClientLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<TenantContext> findBySlug(String slug) {
        return findOne(BASE_SELECT + " AND c.slug = ?", slug);
    }

    @Override
    public Optional<TenantContext> findBySubdomain(String subdomain) {
        return findOne(BASE_SELECT + " AND c.subdomain = ?", subdomain);
    }

    @Override
    public Optional<TenantContext> findByCustomDomain(String customDomain) {
        return findOne(BASE_SELECT + " AND c.custom_domain = ?", customDomain);
    }

    private Optional<TenantContext> findOne(String sql, String parameter) {
        try {
            return jdbcTemplate.query(sql, rs -> rs.next() ? Optional.of(mapRow(rs)) : Optional.empty(), parameter);
        } catch (DataAccessException ex) {
            log.debug("admin.client lookup failed (admin schema missing?): {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private TenantContext mapRow(ResultSet rs) throws SQLException {
        UUID clientId = rs.getObject("id", UUID.class);
        String slug = rs.getString("slug");
        String schema = rs.getString("database_schema");
        if (schema == null || schema.isBlank()) {
            schema = "public";
        }
        return new TenantContext(
                clientId,
                slug,
                schema,
                rs.getString("name"),
                TenantProvisioningStatus.fromDatabase(rs.getString("provisioning_status")),
                rs.getString("billing_status"));
    }
}
