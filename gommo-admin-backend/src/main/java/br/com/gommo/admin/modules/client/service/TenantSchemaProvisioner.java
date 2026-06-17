package br.com.gommo.admin.modules.client.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;

@Service
public class TenantSchemaProvisioner {

    private static final Pattern SAFE_SCHEMA = Pattern.compile("^[a-zA-Z_][a-zA-Z0-9_]*$");

    private static final List<String> TENANT_TABLES = TenantSchemaTableCatalog.HR_DATA_TABLES;

    private final JdbcTemplate jdbcTemplate;
    private final TenantRbacProvisioner tenantRbacProvisioner;

    public TenantSchemaProvisioner(JdbcTemplate jdbcTemplate, TenantRbacProvisioner tenantRbacProvisioner) {
        this.jdbcTemplate = jdbcTemplate;
        this.tenantRbacProvisioner = tenantRbacProvisioner;
    }

    public void provisionDedicatedSchema(Client client) {
        if (client.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }

        String schema = requireSchema(client.getDatabaseSchema());
        if ("public".equalsIgnoreCase(schema)) {
            throw ClientException.databaseConfigIncomplete(
                    "Schema dedicado nao pode ser 'public'. Informe um schema exclusivo do tenant.");
        }

        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\"");

        for (String table : TENANT_TABLES) {
            if (!tenantTableExists(schema, table)) {
                jdbcTemplate.execute("CREATE TABLE \"" + schema + "\".\"" + table + "\" (LIKE public.\"" + table
                        + "\" INCLUDING ALL)");
            }
        }

        tenantRbacProvisioner.provisionRbacTables(schema);
        provisionAuthTables(schema);
        provisionDefaultPayrollEvents(schema);
    }

    private void provisionDefaultPayrollEvents(String schema) {
        if (!tenantTableExists(schema, "payroll_event")) {
            return;
        }

        Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM \"" + schema + "\".payroll_event WHERE status != 'DELETED'", Integer.class);
        if (existing != null && existing > 0) {
            return;
        }

        jdbcTemplate.execute(
                """
                INSERT INTO "%s".payroll_event (
                    id, status, event_code, description, event_type,
                    incides_inss, incides_fgts, incides_irrf, formula, code, created_at
                )
                SELECT
                    p.id, p.status, p.event_code, p.description, p.event_type,
                    p.incides_inss, p.incides_fgts, p.incides_irrf, p.formula, p.code, now()
                FROM public.payroll_event p
                WHERE p.status <> 'DELETED'
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema));
    }

    private void provisionAuthTables(String schema) {
        if (!tenantTableExists(schema, "app_user")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".app_user (
                        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        status          public.status_enum NOT NULL DEFAULT 'ACTIVE',
                        collaborator_id UUID,
                        username        VARCHAR(100) NOT NULL,
                        email           VARCHAR(200) NOT NULL,
                        password_hash   VARCHAR(255) NOT NULL,
                        last_login      TIMESTAMPTZ,
                        must_change_pwd BOOLEAN DEFAULT false,
                        created_by      UUID,
                        created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_by      UUID,
                        updated_at      TIMESTAMPTZ,
                        code            INTEGER NOT NULL
                    )
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX idx_%s_app_user_username
                        ON "%s".app_user (username) WHERE status != 'DELETED'
                    """
                            .formatted(schema.replace('.', '_'), schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX idx_%s_app_user_email
                        ON "%s".app_user (email) WHERE status != 'DELETED'
                    """
                            .formatted(schema.replace('.', '_'), schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_app_user_code
                        ON "%s".app_user (code)
                    """
                            .formatted(schema.replace('.', '_'), schema));
        }

        if (!tenantTableExists(schema, "user_role")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".user_role (
                        user_id UUID NOT NULL REFERENCES "%s".app_user(id),
                        role_id UUID NOT NULL REFERENCES "%s".role(id),
                        PRIMARY KEY (user_id, role_id)
                    )
                    """
                            .formatted(schema, schema, schema));
            jdbcTemplate.execute(
                    """
                    CREATE INDEX idx_%s_user_role_user ON "%s".user_role (user_id)
                    """
                            .formatted(schema.replace('.', '_'), schema));
        }

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
            jdbcTemplate.execute(
                    """
                    CREATE INDEX idx_%s_refresh_token_user ON "%s".refresh_token (user_id)
                    """
                            .formatted(schema.replace('.', '_'), schema));
            jdbcTemplate.execute(
                    """
                    CREATE INDEX idx_%s_refresh_token_hash ON "%s".refresh_token (token_hash)
                    """
                            .formatted(schema.replace('.', '_'), schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_refresh_token_code ON "%s".refresh_token (code)
                    """
                            .formatted(schema.replace('.', '_'), schema));
        }

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
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_refresh_token_blacklist_code
                        ON "%s".refresh_token_blacklist (code)
                    """
                            .formatted(schema.replace('.', '_'), schema));
        }
    }

    public static String defaultSchemaForSlug(String slug) {
        if (!StringUtils.hasText(slug)) {
            return "public";
        }
        return "tenant_" + slug.trim().toLowerCase().replace('-', '_');
    }

    public static String requireSafeSchema(String schema) {
        return requireSchema(schema);
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
