package br.com.gommo.core.tenant;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

    /**
     * Uma linha por par contrato/filial habilitada. Em modo ALL nao ha linha em
     * {@code client_contracted_system_branch}, entao o LEFT JOIN devolve uma linha sem filial e a
     * key e classificada como valida em qualquer uma. Filial nula na associacao e a matriz, que
     * resolve pelo {@code tenant_company_id} do cliente.
     */
    private static final String SELECT_EFFECTIVE_KEY_SCOPE =
            """
            SELECT p.key AS key,
                   c.branch_mode AS branch_mode,
                   COALESCE(cb.tenant_company_id, cl.tenant_company_id) AS company_id
            FROM admin.client_contracted_system c
            INNER JOIN admin.product_system p
                ON p.id = c.product_system_id
               AND p.status <> 'DELETED'
            INNER JOIN admin.client cl
                ON cl.id = c.client_id
            LEFT JOIN admin.client_contracted_system_branch csb
                ON csb.contracted_system_id = c.id
            LEFT JOIN admin.client_branch cb
                ON cb.id = csb.client_branch_id
               AND cb.status <> 'DELETED'
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

    @Override
    public ContractedSystemScope findActiveKeyScope(UUID clientId) {
        if (clientId == null) {
            return ContractedSystemScope.empty();
        }
        try {
            Set<String> allBranches = new LinkedHashSet<>();
            Map<UUID, Set<String>> byCompany = new LinkedHashMap<>();
            jdbcTemplate.query(
                    SELECT_EFFECTIVE_KEY_SCOPE,
                    rs -> {
                        String key = rs.getString("key");
                        if (!"SELECTED".equals(rs.getString("branch_mode"))) {
                            allBranches.add(key);
                            return;
                        }
                        UUID companyId = rs.getObject("company_id", UUID.class);
                        if (companyId != null) {
                            byCompany.computeIfAbsent(companyId, id -> new LinkedHashSet<>()).add(key);
                        }
                    },
                    clientId);

            Map<UUID, List<String>> keysByCompany = new LinkedHashMap<>();
            byCompany.forEach((companyId, keys) -> keysByCompany.put(companyId, List.copyOf(keys)));
            return new ContractedSystemScope(List.copyOf(allBranches), keysByCompany);
        } catch (DataAccessException ex) {
            log.warn("admin contracted systems scope lookup failed for client {}: {}", clientId, ex.getMessage());
            return ContractedSystemScope.empty();
        }
    }
}
