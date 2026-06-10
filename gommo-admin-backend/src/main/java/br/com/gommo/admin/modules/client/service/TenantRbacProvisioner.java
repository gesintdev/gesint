package br.com.gommo.admin.modules.client.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * RBAC isolado por tenant: estrutura + catalogo de dominio (permissoes e perfis de sistema).
 * Nao replica perfis customizados nem outros cadastros do schema public.
 */
@Component
public class TenantRbacProvisioner {

    private final JdbcTemplate jdbcTemplate;

    public TenantRbacProvisioner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void provisionRbacTables(String schema) {
        if (!tableExists(schema, "permission")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".permission (
                        id          UUID PRIMARY KEY,
                        code        INTEGER NOT NULL,
                        authority   VARCHAR(100) NOT NULL,
                        module      VARCHAR(50) NOT NULL,
                        description TEXT
                    )
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_permission_code ON "%s".permission (code)
                    """
                            .formatted(safeIndexToken(schema), schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_permission_authority ON "%s".permission (authority)
                    """
                            .formatted(safeIndexToken(schema), schema));
        }

        if (!tableExists(schema, "role")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".role (
                        id          UUID PRIMARY KEY,
                        code        INTEGER NOT NULL,
                        name        VARCHAR(50) NOT NULL,
                        description TEXT,
                        system      public.system_scope_enum NOT NULL DEFAULT 'RH',
                        status      public.status_enum NOT NULL DEFAULT 'ACTIVE',
                        is_system   BOOLEAN NOT NULL DEFAULT false,
                        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_at  TIMESTAMPTZ
                    )
                    """
                            .formatted(schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_role_code ON "%s".role (code)
                    """
                            .formatted(safeIndexToken(schema), schema));
            jdbcTemplate.execute(
                    """
                    CREATE UNIQUE INDEX uk_%s_role_name ON "%s".role (name)
                    """
                            .formatted(safeIndexToken(schema), schema));
            jdbcTemplate.execute(
                    """
                    CREATE INDEX idx_%s_role_system_status ON "%s".role (system, status)
                    """
                            .formatted(safeIndexToken(schema), schema));
        }

        if (!tableExists(schema, "role_permission")) {
            jdbcTemplate.execute(
                    """
                    CREATE TABLE "%s".role_permission (
                        role_id       UUID NOT NULL REFERENCES "%s".role(id),
                        permission_id UUID NOT NULL REFERENCES "%s".permission(id),
                        PRIMARY KEY (role_id, permission_id)
                    )
                    """
                            .formatted(schema, schema, schema));
        }

        seedDomainCatalog(schema);
    }

    private void seedDomainCatalog(String schema) {
        jdbcTemplate.update(
                """
                INSERT INTO "%s".permission (id, code, authority, module, description)
                SELECT p.id, p.code, p.authority, p.module, p.description
                FROM public.permission p
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema));

        jdbcTemplate.update(
                """
                INSERT INTO "%s".role (
                    id, code, name, description, system, status, is_system, created_at, updated_at
                )
                SELECT r.id, r.code, r.name, r.description, r.system, r.status, r.is_system, r.created_at, r.updated_at
                FROM public.role r
                WHERE r.is_system = true
                ON CONFLICT (id) DO NOTHING
                """
                        .formatted(schema));

        jdbcTemplate.update(
                """
                INSERT INTO "%s".role_permission (role_id, permission_id)
                SELECT rp.role_id, rp.permission_id
                FROM public.role_permission rp
                INNER JOIN public.role r ON r.id = rp.role_id AND r.is_system = true
                ON CONFLICT DO NOTHING
                """
                        .formatted(schema));

        jdbcTemplate.update(
                """
                INSERT INTO "%s".role_permission (role_id, permission_id)
                SELECT '00000000-0000-0000-0000-000000000001'::uuid, p.id
                FROM "%s".permission p
                ON CONFLICT DO NOTHING
                """
                        .formatted(schema, schema));
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = ? AND table_name = ?
                )
                """,
                Boolean.class,
                schema,
                table);
        return Boolean.TRUE.equals(exists);
    }

    private static String safeIndexToken(String schema) {
        return schema.replace('.', '_');
    }
}
