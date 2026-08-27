package br.com.gommo.admin.modules.client.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * {@link TenantSchemaStructureSynchronizer} leva a coluna {@code company_id} ate o tenant, mas
 * DDL nao preenche dados. Este backfill elege a matriz e vincula todo o historico existente a
 * ela, deixando o tenant em estado consistente para o escopo de filial.
 *
 * E idempotente: so age sobre linhas com {@code company_id} nulo e so elege matriz se ainda nao
 * houver uma.
 */
@Service
public class TenantBranchBackfiller {

    private static final Logger log = LoggerFactory.getLogger(TenantBranchBackfiller.class);

    private final JdbcTemplate jdbcTemplate;

    public TenantBranchBackfiller(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void backfill(String rawSchema) {
        String schema = TenantSchemaProvisioner.requireSafeSchema(rawSchema);

        electHeadquarters(schema);
        String headquartersId = headquartersId(schema);
        if (headquartersId == null) {
            log.warn("Schema {} sem empresa cadastrada: backfill de filial adiado.", schema);
            return;
        }

        attachOrphanBranches(schema, headquartersId);
        backfillScopedTables(schema, headquartersId);
        promoteUserRoleKey(schema);
    }

    private void electHeadquarters(String schema) {
        jdbcTemplate.update(
                """
                UPDATE "%s".company
                   SET is_headquarters = true
                 WHERE id = (
                        SELECT id FROM "%s".company WHERE status <> 'DELETED' ORDER BY created_at, code LIMIT 1
                       )
                   AND NOT EXISTS (
                        SELECT 1 FROM "%s".company WHERE is_headquarters AND status <> 'DELETED'
                       )
                """
                        .formatted(schema, schema, schema));
    }

    private String headquartersId(String schema) {
        List<String> ids = jdbcTemplate.queryForList(
                "SELECT id::text FROM \"" + schema + "\".company WHERE is_headquarters AND status <> 'DELETED' LIMIT 1",
                String.class);
        return ids.isEmpty() ? null : ids.get(0);
    }

    private void attachOrphanBranches(String schema, String headquartersId) {
        jdbcTemplate.update(
                """
                UPDATE "%s".company
                   SET parent_id = ?::uuid
                 WHERE NOT is_headquarters
                   AND parent_id IS NULL
                   AND status <> 'DELETED'
                """
                        .formatted(schema),
                headquartersId);
    }

    private void backfillScopedTables(String schema, String headquartersId) {
        for (String table : scopedTables(schema)) {
            jdbcTemplate.update(
                    "UPDATE \"" + schema + "\".\"" + table + "\" SET company_id = ?::uuid WHERE company_id IS NULL",
                    headquartersId);
        }
    }

    private List<String> scopedTables(String schema) {
        return jdbcTemplate.queryForList(
                """
                SELECT table_name
                  FROM information_schema.columns
                 WHERE table_schema = ?
                   AND column_name = 'company_id'
                   AND table_name <> 'company'
                """,
                String.class,
                schema);
    }

    /**
     * Alinha {@code user_role} do tenant ao modelo por filial: chave propria e unicidade por
     * usuario, perfil e filial, que e o que permite perfis distintos em cada uma.
     *
     * A filial continua opcional porque o vinculo com filial nula e o que vale em todas elas
     * (admin de plataforma e o seed inicial do tenant). Nulo em componente de chave composta faz o
     * JPA devolver a entidade como nula, por isso a chave e propria e a unicidade vira indice com
     * COALESCE.
     */
    private void promoteUserRoleKey(String schema) {
        // A PK sai primeiro: o Postgres recusa soltar o NOT NULL de coluna que ainda participa dela.
        List<String> primaryKey = jdbcTemplate.queryForList(
                """
                SELECT conname
                  FROM pg_constraint
                 WHERE conrelid = to_regclass(?)::oid
                   AND contype = 'p'
                """,
                String.class,
                "\"" + schema + "\".user_role");
        for (String constraint : primaryKey) {
            jdbcTemplate.execute(
                    "ALTER TABLE \"" + schema + "\".user_role DROP CONSTRAINT \"" + constraint + "\"");
        }

        jdbcTemplate.execute(
                "ALTER TABLE \"" + schema + "\".user_role ALTER COLUMN company_id DROP NOT NULL");

        jdbcTemplate.execute("ALTER TABLE \"" + schema + "\".user_role ADD COLUMN IF NOT EXISTS id UUID");
        jdbcTemplate.update("UPDATE \"" + schema + "\".user_role SET id = gen_random_uuid() WHERE id IS NULL");
        jdbcTemplate.execute("ALTER TABLE \"" + schema + "\".user_role ALTER COLUMN id SET NOT NULL");
        jdbcTemplate.execute(
                "ALTER TABLE \"" + schema + "\".user_role ALTER COLUMN id SET DEFAULT gen_random_uuid()");
        jdbcTemplate.execute("ALTER TABLE \"" + schema + "\".user_role ADD PRIMARY KEY (id)");

        jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uk_user_role_user_role_company ON \"" + schema
                + "\".user_role (user_id, role_id,"
                + " COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid))");
    }
}
