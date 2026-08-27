package br.com.gommo.admin.modules.clientcontractedsystem.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Filiais habilitadas de um contrato.
 *
 * A tabela nao tem id proprio e usa {@code client_branch_id} nulo para representar a matriz, que
 * nao tem linha em {@code admin.client_branch}. Elemento nulo em colecao e um caso que o Hibernate
 * trata mal, entao a associacao e manipulada por JDBC, com a escrita sempre substituindo o conjunto
 * inteiro.
 */
@Repository
public class ContractedSystemBranchScopeRepository {

    private final JdbcTemplate jdbcTemplate;

    public ContractedSystemBranchScopeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** Ids das filiais habilitadas. A matriz aparece como {@code null}. */
    public List<UUID> findBranchIds(UUID contractedSystemId) {
        return jdbcTemplate.query(
                "SELECT client_branch_id FROM admin.client_contracted_system_branch WHERE contracted_system_id = ?",
                (rs, rowNum) -> rs.getObject("client_branch_id", UUID.class),
                contractedSystemId);
    }

    public boolean includesHeadquarters(UUID contractedSystemId) {
        return findBranchIds(contractedSystemId).stream().anyMatch(id -> id == null);
    }

    public void replace(UUID contractedSystemId, boolean includeHeadquarters, Collection<UUID> branchIds) {
        jdbcTemplate.update(
                "DELETE FROM admin.client_contracted_system_branch WHERE contracted_system_id = ?",
                contractedSystemId);

        List<Object[]> rows = new ArrayList<>();
        if (includeHeadquarters) {
            rows.add(new Object[] {contractedSystemId, null});
        }
        if (branchIds != null) {
            branchIds.stream()
                    .filter(java.util.Objects::nonNull)
                    .distinct()
                    .forEach(branchId -> rows.add(new Object[] {contractedSystemId, branchId}));
        }
        if (rows.isEmpty()) {
            return;
        }
        jdbcTemplate.batchUpdate(
                "INSERT INTO admin.client_contracted_system_branch (contracted_system_id, client_branch_id) VALUES (?, ?)",
                rows);
    }

    public void clear(UUID contractedSystemId) {
        jdbcTemplate.update(
                "DELETE FROM admin.client_contracted_system_branch WHERE contracted_system_id = ?",
                contractedSystemId);
    }
}
