package br.com.gesint.admin.modules.client.service;

import java.util.regex.Pattern;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gesint.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gesint.admin.modules.client.exception.ClientException;
import br.com.gesint.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

@Service
public class TenantSchemaProvisioner {

    private static final Pattern SAFE_SCHEMA = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");

    private final JdbcTemplate jdbcTemplate;
    private final TenantDefaultDataProvisioner defaultDataProvisioner;
    private final TenantSchemaStructureSynchronizer structureSynchronizer;
    private final TenantBranchBackfiller branchBackfiller;

    public TenantSchemaProvisioner(
            JdbcTemplate jdbcTemplate,
            TenantDefaultDataProvisioner defaultDataProvisioner,
            TenantSchemaStructureSynchronizer structureSynchronizer,
            TenantBranchBackfiller branchBackfiller) {
        this.jdbcTemplate = jdbcTemplate;
        this.defaultDataProvisioner = defaultDataProvisioner;
        this.structureSynchronizer = structureSynchronizer;
        this.branchBackfiller = branchBackfiller;
    }

    public void provisionDedicatedSchema(ClientEnvironmentConfig config) {
        if (config.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }

        String schema = requireSchema(config.getDatabaseSchema());
        if ("public".equalsIgnoreCase(schema)) {
            throw ClientException.databaseConfigIncomplete(
                    "Schema dedicado nao pode ser 'public'. Informe um schema exclusivo do tenant.");
        }

        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");

        // Cria as tabelas ausentes e, nas que ja existem, aplica colunas/indices novos do template public.
        structureSynchronizer.sync(schema);

        defaultDataProvisioner.seedDefaults(schema);
        provisionAuthTables(schema);
        branchBackfiller.backfill(schema);
    }

    private void provisionAuthTables(String schema) {
        if (!tenantTableExists(schema, "app_user")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".app_user (
                        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        status                  gesint_types.status_enum NOT NULL DEFAULT 'ACTIVE',
                        collaborator_id         UUID,
                        name                    VARCHAR(255),
                        username                VARCHAR(100) NOT NULL,
                        email                   VARCHAR(200) NOT NULL,
                        password_hash           VARCHAR(255),
                        access_token_hash       VARCHAR(64),
                        first_access_completed  BOOLEAN NOT NULL DEFAULT false,
                        last_login              TIMESTAMPTZ,
                        created_by              UUID,
                        created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_by              UUID,
                        updated_at              TIMESTAMPTZ,
                        code                    INTEGER NOT NULL
                    )
                    """
                            .formatted(schema));
        } else {
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".app_user
                        ADD COLUMN IF NOT EXISTS name VARCHAR(255)
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".app_user
                        ALTER COLUMN password_hash DROP NOT NULL
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".app_user
                        ADD COLUMN IF NOT EXISTS access_token_hash VARCHAR(64)
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".app_user
                        ADD COLUMN IF NOT EXISTS first_access_completed BOOLEAN NOT NULL DEFAULT false
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".app_user
                        DROP COLUMN IF EXISTS must_change_pwd
                    """
                            .formatted(schema));
        }
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS %s
                    ON "%s".app_user (username) WHERE status != 'DELETED'
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "app_user_username"), schema));
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS %s
                    ON "%s".app_user (email) WHERE status != 'DELETED'
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "app_user_email"), schema));
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS %s
                    ON "%s".app_user (code)
                """
                        .formatted(TenantIndexNames.unique("uk", schema, "app_user_code"), schema));

        if (!tenantTableExists(schema, "user_role")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".user_role (
                        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id    UUID NOT NULL REFERENCES "%s".app_user(id),
                        role_id    UUID NOT NULL REFERENCES "%s".role(id),
                        company_id UUID
                    )
                    """
                            .formatted(schema, schema, schema));
        } else {
            jdbcTemplate.execute(
                    """
                    ALTER TABLE "%s".user_role
                        ADD COLUMN IF NOT EXISTS company_id UUID
                    """
                            .formatted(schema));
        }
        // A chave propria e a unicidade por filial ficam com TenantBranchBackfiller, que trata os
        // schemas antigos onde a PK ainda e o par usuario/perfil.
        jdbcTemplate.execute(
                """
                CREATE INDEX IF NOT EXISTS %s ON "%s".user_role (company_id)
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "user_role_company"), schema));
        jdbcTemplate.execute(
                """
                CREATE INDEX IF NOT EXISTS %s ON "%s".user_role (user_id)
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "user_role_user"), schema));

        if (!tenantTableExists(schema, "refresh_token")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".refresh_token (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id     UUID NOT NULL REFERENCES "%s".app_user(id),
                        token_hash  VARCHAR(255) NOT NULL UNIQUE,
                        expires_at  TIMESTAMPTZ NOT NULL,
                        revoked     BOOLEAN NOT NULL DEFAULT false,
                        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                        code        INTEGER NOT NULL
                    )
                    """
                            .formatted(schema, schema));
        }
        jdbcTemplate.execute(
                """
                CREATE INDEX IF NOT EXISTS %s ON "%s".refresh_token (user_id)
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "refresh_token_user"), schema));
        jdbcTemplate.execute(
                """
                CREATE INDEX IF NOT EXISTS %s ON "%s".refresh_token (token_hash)
                """
                        .formatted(TenantIndexNames.unique("idx", schema, "refresh_token_hash"), schema));
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS %s ON "%s".refresh_token (code)
                """
                        .formatted(TenantIndexNames.unique("uk", schema, "refresh_token_code"), schema));

        if (!tenantTableExists(schema, "refresh_token_blacklist")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".refresh_token_blacklist (
                        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        token_hash  VARCHAR(255) NOT NULL UNIQUE,
                        revoked_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                        code        INTEGER NOT NULL
                    )
                    """
                            .formatted(schema));
        }
        jdbcTemplate.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS %s
                    ON "%s".refresh_token_blacklist (code)
                """
                        .formatted(
                                TenantIndexNames.unique("uk", schema, "refresh_token_blacklist_code"), schema));
    }
    public static String defaultSchemaForSlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            return "public";
        }
        // Reusa a normalizacao do applier (inclui limite de 63 chars do PostgreSQL).
        String candidate = TenantDatabaseDefaultsApplier.normalizeSchema("tenant_" + slug.trim());
        return StringUtils.hasText(candidate) ? candidate : "public";
    }

    public static String requireSafeSchema(String schema) {
        return requireSchema(schema);
    }

    public static boolean isSafeSchemaName(String schema) {
        return StringUtils.hasText(schema) && SAFE_SCHEMA.matcher(schema.trim()).matches();
    }

    private boolean tenantTableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = ?
                      AND table_name = ?
                )
                """,
                Boolean.class,
                schema,
                table);
        return Boolean.TRUE.equals(exists);
    }

    private static String requireSchema(String schema) {
        if (!StringUtils.hasText(schema)) {
            throw ClientException.databaseConfigIncomplete("Schema do tenant e obrigatorio para DEDICATED_SCHEMA.");
        }
        String normalized = schema.trim();
        if (!SAFE_SCHEMA.matcher(normalized).matches()) {
            throw ClientException.databaseConfigIncomplete("Nome de schema invalido: " + schema);
        }
        return normalized;
    }
}
