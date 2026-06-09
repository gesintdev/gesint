package br.com.gommo.core.tenant;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.springframework.jdbc.datasource.DelegatingDataSource;

public class TenantSchemaDataSource extends DelegatingDataSource {

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
                .filter(context -> !context.isPlatformAccess())
                .map(TenantContext::schema)
                .map(TenantSchemaNames::requireSafe)
                .map(schema -> "SET search_path TO \"" + schema + "\", public")
                .orElse("SET search_path TO public");

        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }
}
