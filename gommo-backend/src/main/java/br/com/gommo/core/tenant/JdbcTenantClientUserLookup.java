package br.com.gommo.core.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Repository
public class JdbcTenantClientUserLookup implements TenantClientUserLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcTenantClientUserLookup.class);

    private static final String SQL_REGISTERED_USERNAME =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.client_user
                WHERE LOWER(username) = LOWER(?)
                  AND status <> 'DELETED'
            )
            """;

    private static final String SQL_LINKED_TO_CLIENT =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.client_user
                WHERE client_id = ?
                  AND tenant_app_user_id = ?
                  AND status <> 'DELETED'
            )
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcTenantClientUserLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean isRegisteredClientUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL_REGISTERED_USERNAME, Boolean.class, username.trim());
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.client_user username lookup failed: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isLinkedToClient(UUID clientId, UUID appUserId) {
        if (clientId == null || appUserId == null) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL_LINKED_TO_CLIENT, Boolean.class, clientId, appUserId);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.client_user client linkage lookup failed: {}", ex.getMessage());
            return false;
        }
    }
}
