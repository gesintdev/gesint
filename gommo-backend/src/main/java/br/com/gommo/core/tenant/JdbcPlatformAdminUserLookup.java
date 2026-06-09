package br.com.gommo.core.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

@Repository
public class JdbcPlatformAdminUserLookup implements PlatformAdminUserLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcPlatformAdminUserLookup.class);

    private static final String SQL_BY_USERNAME =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.admin_user
                WHERE LOWER(username) = LOWER(?)
                  AND status <> 'DELETED'
            )
            """;

    private static final String SQL_BY_APP_USER_ID =
            """
            SELECT EXISTS (
                SELECT 1
                FROM admin.admin_user au
                INNER JOIN public.app_user u ON LOWER(au.username) = LOWER(u.username)
                WHERE u.id = ?
                  AND au.status <> 'DELETED'
                  AND u.status <> 'DELETED'
            )
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcPlatformAdminUserLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean isPlatformAdmin(String username) {
        if (!StringUtils.hasText(username)) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL_BY_USERNAME, Boolean.class, username.trim());
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.admin_user lookup failed: {}", ex.getMessage());
            return false;
        }
    }

    @Override
    public boolean isPlatformAdminAppUser(UUID appUserId) {
        if (appUserId == null) {
            return false;
        }
        try {
            Boolean exists = jdbcTemplate.queryForObject(SQL_BY_APP_USER_ID, Boolean.class, appUserId);
            return Boolean.TRUE.equals(exists);
        } catch (DataAccessException ex) {
            log.debug("admin.admin_user app_user lookup failed: {}", ex.getMessage());
            return false;
        }
    }
}
