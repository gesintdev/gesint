package br.com.gommo.modules.root.assistant.log;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.modules.root.security.SystemAdminUsers;

@Repository
public class JdbcAssistantErrorLogWriter implements AssistantErrorLogWriter {

    private static final Logger log = LoggerFactory.getLogger(JdbcAssistantErrorLogWriter.class);

    private static final String INSERT =
            """
            INSERT INTO admin.assistant_error_log
                (id, client_id, client_name, user_id, user_name, user_email, tenant_schema, summary, error_class, created_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, now())
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcAssistantErrorLogWriter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void write(String summary, String errorClass) {
        try {
            TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
            UUID clientId = tenant != null ? tenant.clientId() : null;
            String clientName = tenant != null ? tenant.name() : null;
            String tenantSchema = tenant != null ? tenant.schema() : null;
            UUID userId = SystemAdminUsers.currentUserId().orElse(null);
            String userName = null;
            String userEmail = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && StringUtils.hasText(auth.getName())) {
                userName = auth.getName();
            }
            jdbcTemplate.update(
                    INSERT,
                    UUID.randomUUID(),
                    clientId,
                    truncate(clientName, 200),
                    userId,
                    truncate(userName, 200),
                    truncate(userEmail, 200),
                    truncate(tenantSchema, 100),
                    truncate(summary, 500),
                    truncate(errorClass, 200));
        } catch (DataAccessException ex) {
            log.warn("Failed to persist assistant error log: {}", ex.getMessage());
        } catch (RuntimeException ex) {
            log.warn("Unexpected failure persisting assistant error log: {}", ex.getMessage());
        }
    }

    private static String truncate(String value, int max) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > max ? trimmed.substring(0, max) : trimmed;
    }
}
