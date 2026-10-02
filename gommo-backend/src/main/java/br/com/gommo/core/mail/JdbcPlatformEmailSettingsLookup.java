package br.com.gommo.core.mail;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcPlatformEmailSettingsLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcPlatformEmailSettingsLookup.class);

    private static final String SQL_ENABLED_SETTINGS =
            """
            SELECT host, port, security, username, password_encrypted, from_address, from_name, reply_to
            FROM admin.platform_email_settings
            WHERE enabled = TRUE
              AND status <> 'DELETED'
              AND host IS NOT NULL
              AND port IS NOT NULL
            ORDER BY created_at
            LIMIT 1
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcPlatformEmailSettingsLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<PlatformEmailSettings> findEnabled() {
        try {
            List<PlatformEmailSettings> rows = jdbcTemplate.query(
                    SQL_ENABLED_SETTINGS,
                    (rs, rowNum) -> new PlatformEmailSettings(
                            rs.getString("host"),
                            rs.getInt("port"),
                            rs.getString("security"),
                            rs.getString("username"),
                            rs.getBytes("password_encrypted"),
                            rs.getString("from_address"),
                            rs.getString("from_name"),
                            rs.getString("reply_to")));
            return rows.stream().findFirst();
        } catch (DataAccessException ex) {
            log.debug("admin.platform_email_settings lookup failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
