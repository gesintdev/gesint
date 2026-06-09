package br.com.gommo.core.tenant;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantClientUserLookup implements TenantClientUserLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcTenantClientUserLookup.class);

    private static final String SQL =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.client_user
                WHERE app_user_id = ?
                  AND client_id = ?
                  AND status <> 'DELETED'
            )
            """;

    private static final String SQL_ANY_CLIENT =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.client_user
                WHERE app_user_id = ?
                  AND status <> 'DELETED'
            )
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcTenantClientUserLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean belongsToTenant(UUID appUserId, UUID clientId) {
        if (appUserId == null || clientId == null) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL, Boolean.class, appUserId, clientId);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.client_user lookup failed: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isBoundToAnyClient(UUID appUserId) {
        if (appUserId == null) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL_ANY_CLIENT, Boolean.class, appUserId);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.client_user lookup failed: {}", ex.getMessage());
            return false;
        }
    }
}
