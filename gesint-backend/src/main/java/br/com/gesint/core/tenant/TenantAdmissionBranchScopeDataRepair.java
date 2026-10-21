package br.com.gesint.core.tenant;

import java.util.LinkedHashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Propaga {@code company_id} da admissao para {@code admission_step} e {@code esocial_event}, e
 * preenche admissoes sem filial com a matriz. Idempotente — roda no startup como rede de seguranca
 * apos a V95 (ou correcoes manuais pontuais).
 */
@Component
public class TenantAdmissionBranchScopeDataRepair {

    private static final Logger log = LoggerFactory.getLogger(TenantAdmissionBranchScopeDataRepair.class);

    private static final String SELECT_SCHEMAS_FROM_ADMIN =
            """
            SELECT DISTINCT cec.database_schema
              FROM admin.client_environment_config cec
             WHERE cec.status <> 'DELETED'
               AND cec.database_schema IS NOT NULL
               AND cec.database_schema <> 'public'
            """;

    private static final String SELECT_TENANT_SCHEMAS =
            """
            SELECT schema_name
              FROM information_schema.schemata
             WHERE schema_name LIKE 'tenant\\_%' ESCAPE '\\'
            """;

    private final JdbcTemplate jdbcTemplate;

    public TenantAdmissionBranchScopeDataRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int repairAllTenants() {
        Set<String> schemas = resolveTenantSchemas();
        int repairedSchemas = 0;
        for (String schema : schemas) {
            if (repairSchema(schema) > 0) {
                repairedSchemas++;
            }
        }
        return repairedSchemas;
    }

    private Set<String> resolveTenantSchemas() {
        Set<String> schemas = new LinkedHashSet<>();
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_SCHEMAS_FROM_ADMIN, String.class));
        } catch (DataAccessException ex) {
            log.debug("admin.client_environment_config indisponivel para reparo de admissao: {}", ex.getMessage());
        }
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_TENANT_SCHEMAS, String.class));
        } catch (DataAccessException ex) {
            log.warn("Nao foi possivel listar schemas tenant_* para reparo de admissao: {}", ex.getMessage());
        }
        return schemas;
    }

    private int repairSchema(String rawSchema) {
        String schema = TenantSchemaNames.requireSafe(rawSchema);
        if ("public".equalsIgnoreCase(schema)) {
            return 0;
        }
        if (!tableExists(schema, "admission_process")) {
            return 0;
        }

        int repaired = 0;
        repaired += ensureColumn(schema, "admission_process", "company_id", "UUID");
        repaired += backfillAdmissionHeadquarters(schema);
        repaired += propagateCompanyId(schema, "admission_step");
        repaired += propagateCompanyId(schema, "esocial_event");
        repaired += backfillCollaboratorScopeFromAdmission(schema);
        return repaired > 0 ? 1 : 0;
    }

    /** Colaborador/endereco/contato criados na admissao antes do escopo por filial ficarem sem company_id. */
    private int backfillCollaboratorScopeFromAdmission(String schema) {
        if (!tableExists(schema, "collaborator") || !tableExists(schema, "admission_process")) {
            return 0;
        }
        int repaired = 0;
        try {
            repaired += jdbcTemplate.update(
                    """
                    UPDATE %s.collaborator c
                       SET company_id = ap.company_id
                      FROM %s.admission_process ap
                     WHERE ap.collaborator_id = c.id
                       AND ap.company_id IS NOT NULL
                       AND (c.company_id IS NULL OR c.company_id <> ap.company_id)
                    """
                            .formatted(quoted(schema), quoted(schema)));
        } catch (DataAccessException ex) {
            log.error("Falha ao propagar company_id para {}.collaborator: {}", schema, ex.getMessage());
        }
        if (tableExists(schema, "collaborator_address")) {
            try {
                repaired += jdbcTemplate.update(
                        """
                        UPDATE %s.collaborator_address ca
                           SET company_id = c.company_id
                          FROM %s.collaborator c
                         WHERE ca.collaborator_id = c.id
                           AND c.company_id IS NOT NULL
                           AND (ca.company_id IS NULL OR ca.company_id <> c.company_id)
                        """
                                .formatted(quoted(schema), quoted(schema)));
            } catch (DataAccessException ex) {
                log.error("Falha ao propagar company_id para {}.collaborator_address: {}", schema, ex.getMessage());
            }
        }
        if (tableExists(schema, "collaborator_contact")) {
            try {
                repaired += jdbcTemplate.update(
                        """
                        UPDATE %s.collaborator_contact cc
                           SET company_id = c.company_id
                          FROM %s.collaborator c
                         WHERE cc.collaborator_id = c.id
                           AND c.company_id IS NOT NULL
                           AND (cc.company_id IS NULL OR cc.company_id <> c.company_id)
                        """
                                .formatted(quoted(schema), quoted(schema)));
            } catch (DataAccessException ex) {
                log.error("Falha ao propagar company_id para {}.collaborator_contact: {}", schema, ex.getMessage());
            }
        }
        return repaired;
    }

    private int ensureColumn(String schema, String table, String column, String type) {
        if (!tableExists(schema, table) || columnExists(schema, table, column)) {
            return 0;
        }
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE " + quoted(schema, table) + " ADD COLUMN " + column + " " + type);
            log.warn("Coluna {}.{}.{} criada no reparo de admissao.", schema, table, column);
            return 1;
        } catch (DataAccessException ex) {
            log.error("Falha ao criar {}.{}.{}: {}", schema, table, column, ex.getMessage());
            return 0;
        }
    }

    private int backfillAdmissionHeadquarters(String schema) {
        try {
            return jdbcTemplate.update(
                    """
                    UPDATE %s.admission_process ap
                       SET company_id = hq.id
                      FROM %s.company hq
                     WHERE ap.company_id IS NULL
                       AND ap.status <> 'DELETED'
                       AND hq.status <> 'DELETED'
                       AND hq.is_headquarters
                    """
                            .formatted(quoted(schema), quoted(schema)));
        } catch (DataAccessException ex) {
            log.debug("Backfill matriz em {}.admission_process ignorado: {}", schema, ex.getMessage());
            return 0;
        }
    }

    private int propagateCompanyId(String schema, String childTable) {
        if (!tableExists(schema, childTable) || !columnExists(schema, childTable, "company_id")) {
            return 0;
        }
        try {
            return jdbcTemplate.update(
                    """
                    UPDATE %s.%s child
                       SET company_id = ap.company_id
                      FROM %s.admission_process ap
                     WHERE child.admission_id = ap.id
                       AND ap.company_id IS NOT NULL
                       AND (child.company_id IS NULL OR child.company_id <> ap.company_id)
                    """
                            .formatted(quoted(schema), childTable, quoted(schema)));
        } catch (DataAccessException ex) {
            log.error("Falha ao propagar company_id para {}.{}: {}", schema, childTable, ex.getMessage());
            return 0;
        }
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, table));
        return Boolean.TRUE.equals(exists);
    }

    private boolean columnExists(String schema, String table, String column) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                      FROM information_schema.columns
                     WHERE table_schema = ?
                       AND table_name = ?
                       AND column_name = ?
                )
                """,
                Boolean.class,
                schema,
                table,
                column);
        return Boolean.TRUE.equals(exists);
    }

    private static String quoted(String schema) {
        return "\"" + schema + "\"";
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }
}
