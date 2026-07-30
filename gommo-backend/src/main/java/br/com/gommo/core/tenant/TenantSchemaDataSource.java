package br.com.gommo.core.tenant;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;

import org.springframework.jdbc.datasource.DelegatingDataSource;

/**
 * Ajusta o {@code search_path} por conexao conforme o {@link TenantContext}.
 *
 * <p>Regra de isolamento (fail-closed):
 * <ul>
 *   <li>Tenant comercial → {@code "schema_do_cliente", gommo_types}.
 *       {@code gommo_types} tem apenas enums (sem tabelas). Tabela ausente no tenant falha;
 *       nao ha fallback de dados para {@code public}.</li>
 *   <li>Sem tenant ({@code localhost} / platform / dev-public) → {@code public, gommo_types}.</li>
 *   <li>Control plane ({@code admin.*}) permanece schema-qualified; nao entra no path.</li>
 *   <li>Catálogos compartilhados (city, state, cbo_occupation) usam {@code @Table(schema = "public")}
 *       nas entidades — não entram no schema do tenant e não reabrem fallback genérico para {@code public}.</li>
 * </ul>
 */
public class TenantSchemaDataSource extends DelegatingDataSource {

    /**
     * Schema sem tabelas de negocio — apenas enums movidos de {@code public}.
     * Permite {@code CAST(? AS status_enum)} sem reabrir vazamento via tabelas de {@code public}.
     */
    public static final String SHARED_TYPES_SCHEMA = "gommo_types";

    public TenantSchemaDataSource(DataSource target) {
        super(target);
    }

    @Override
    public Connection getConnection() throws SQLException {
        return prepare(super.getConnection());
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        return prepare(super.getConnection(username, password));
    }

    private Connection prepare(Connection connection) throws SQLException {
        applySearchPath(connection);
        return connection;
    }

    static void applySearchPath(Connection connection) throws SQLException {
        String sql = TenantContextHolder.getOptional()
                .filter(TenantSchemaDataSource::usesDedicatedTenantSchema)
                .map(TenantContext::schema)
                .map(TenantSchemaNames::requireSafe)
                .map(schema -> "SET search_path TO \"" + schema + "\", " + SHARED_TYPES_SCHEMA)
                .orElse("SET search_path TO public, " + SHARED_TYPES_SCHEMA);

        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    /**
     * Tenant comercial com schema dedicado. Platform, dev-public e schema {@code public}
     * usam o caminho legado de desenvolvimento / operador.
     */
    static boolean usesDedicatedTenantSchema(TenantContext context) {
        if (context == null || context.isPlatformAccess() || context.isDevelopmentPublic()) {
            return false;
        }
        String schema = context.schema();
        return schema != null && !schema.isBlank() && !"public".equalsIgnoreCase(schema.trim());
    }
}
