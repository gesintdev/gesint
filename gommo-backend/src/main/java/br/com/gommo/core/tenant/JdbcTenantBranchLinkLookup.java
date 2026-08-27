package br.com.gommo.core.tenant;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcTenantBranchLinkLookup implements TenantBranchLinkLookup {

    private static final Logger log = LoggerFactory.getLogger(JdbcTenantBranchLinkLookup.class);

    /** Matriz e filiais chegam por caminhos distintos, mas valem o mesmo para o seletor. */
    private static final String SELECT_PROVISIONED_COMPANY_IDS =
            """
            SELECT cl.tenant_company_id AS company_id
            FROM admin.client cl
            WHERE cl.id = ?
              AND cl.status <> 'DELETED'
              AND cl.tenant_company_id IS NOT NULL
            UNION
            SELECT cb.tenant_company_id AS company_id
            FROM admin.client_branch cb
            WHERE cb.client_id = ?
              AND cb.status <> 'DELETED'
              AND cb.tenant_company_id IS NOT NULL
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcTenantBranchLinkLookup(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Set<UUID> findProvisionedCompanyIds(UUID clientId) {
        if (clientId == null) {
            return Collections.emptySet();
        }
        try {
            Set<UUID> companyIds = new LinkedHashSet<>();
            jdbcTemplate.query(
                    SELECT_PROVISIONED_COMPANY_IDS,
                    rs -> {
                        UUID companyId = rs.getObject("company_id", UUID.class);
                        if (companyId != null) {
                            companyIds.add(companyId);
                        }
                    },
                    clientId,
                    clientId);
            return companyIds;
        } catch (DataAccessException ex) {
            log.warn("admin branch link lookup failed for client {}: {}", clientId, ex.getMessage());
            return Collections.emptySet();
        }
    }
}
