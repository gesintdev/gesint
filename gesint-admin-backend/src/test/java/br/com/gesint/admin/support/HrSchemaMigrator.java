package br.com.gesint.admin.support;

import java.nio.file.Files;
import java.nio.file.Path;

import org.flywaydb.core.Flyway;

/**
 * Aplica migrations do HR ({@code gesint-backend}) no schema {@code public} antes do Flyway do admin.
 */
final class HrSchemaMigrator {

    private HrSchemaMigrator() {}

    static void migrate(String jdbcUrl, String user, String password) {
        Path migrations = resolveHrMigrationsDirectory();
        Flyway.configure()
                .dataSource(jdbcUrl, user, password)
                .schemas("public")
                .defaultSchema("public")
                .createSchemas(true)
                .locations("filesystem:" + migrations.toAbsolutePath())
                .table("flyway_schema_history")
                .load()
                .migrate();
    }

    private static Path resolveHrMigrationsDirectory() {
        Path fromModule = Path.of("..", "gesint-backend", "src", "main", "resources", "db", "migration");
        if (Files.isDirectory(fromModule)) {
            return fromModule.normalize();
        }
        Path fromRoot = Path.of("gesint-backend", "src", "main", "resources", "db", "migration");
        if (Files.isDirectory(fromRoot)) {
            return fromRoot.normalize();
        }
        throw new IllegalStateException(
                "Diretório de migrations do gesint-backend não encontrado. Execute os testes a partir do monorepo.");
    }
}
