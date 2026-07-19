package br.com.gommo.core.tenant;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantContractedSystemsLookup implements TenantContractedSystemsLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcTenantContractedSystemsLookup.class);

    private static final String SELECT_EFFECTIVE_KEYS =
            """
            SELECT p.key
            FROM admin.client_contracted_system c
            INNER JOIN admin.product_system p
                ON p.id = c.product_system_id
               AND p.status <> 'DELETED'
            WHERE c.client_id = ?
              AND c.status <> 'DELETED'
              AND c.operational_status = 'ACTIVE'
              AND (c.effective_from IS NULL OR c.effective_from <= now())
              AND (c.deactivate_at IS NULL OR c.deactivate_at > now())
            ORDER BY p.sort_order, p.key
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcTenantContractedSystemsLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<String> findActiveKeysByClientId(UUID clientId) {
        if (clientId == null) {
            return Collections.emptyList();
        }
        try {
            return jdbcTemplate.query(SELECT_EFFECTIVE_KEYS, (rs, rowNum) -> rs.getString("key"), clientId);
        } catch (DataAccessException ex) {
            log.warn("admin contracted systems lookup failed for client {}: {}", clientId, ex.getMessage());
            return Collections.emptyList();
        }
    }
}
