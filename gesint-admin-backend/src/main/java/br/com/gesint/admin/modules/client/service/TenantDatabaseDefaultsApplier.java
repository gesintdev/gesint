package br.com.gesint.admin.modules.client.service;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gesint.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gesint.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

/**
 * Preenche apenas defaults de conexao ausentes. O nome do schema vem de
 * {@code client_environment_config.database_schema}: se ja estiver gravado, e preservado.
 * So preenche schema quando o campo estiver vazio (cadastro novo).
 */
@Component
public class TenantDatabaseDefaultsApplier {

    private static final String DEFAULT_SECRET_REF = "DB_PASSWORD";
    private static final int MAX_SCHEMA_LENGTH = 63;

    private final Environment environment;

    public TenantDatabaseDefaultsApplier(Environment environment) {
        this.environment = environment;
    }

    public void apply(ClientEnvironmentConfig entity, String slug) {
        if (entity.getDatabaseStrategy() != TenantDatabaseStrategyEnum.DEDICATED_SCHEMA) {
            return;
        }

        if (!StringUtils.hasText(entity.getSubdomain()) && StringUtils.hasText(slug)) {
            entity.setSubdomain(slug.trim());
        }

        String normalizedSchema = normalizeSchema(entity.getDatabaseSchema());
        if (StringUtils.hasText(normalizedSchema) && !"public".equalsIgnoreCase(normalizedSchema)) {
            // Fonte da verdade: o que esta (ou foi digitado) no cadastro do ambiente.
            entity.setDatabaseSchema(normalizedSchema);
        } else if (!StringUtils.hasText(normalizedSchema) || "public".equalsIgnoreCase(normalizedSchema)) {
            // Cadastro novo / campo vazio: default explicito tenant_{slug}.
            entity.setDatabaseSchema(TenantSchemaProvisioner.defaultSchemaForSlug(slug));
        }

        if (!StringUtils.hasText(entity.getDatabaseHost())) {
            entity.setDatabaseHost(property("DB_HOST", "localhost"));
        }
        if (entity.getDatabasePort() == null) {
            entity.setDatabasePort(Integer.parseInt(property("DB_PORT", "5432")));
        }
        if (!StringUtils.hasText(entity.getDatabaseName())) {
            entity.setDatabaseName(property("DB_NAME", property("POSTGRES_DB", "gesint")));
        }
        if (!StringUtils.hasText(entity.getDatabaseUser())) {
            entity.setDatabaseUser(property("DB_USER", property("POSTGRES_USER", "gesint")));
        }
        if (!StringUtils.hasText(entity.getDatabaseSecretRef())) {
            entity.setDatabaseSecretRef(DEFAULT_SECRET_REF);
        }
    }

    /**
     * Preserva o valor digitado pelo usuario, apenas sanitizando para identificador PostgreSQL.
     */
    static String normalizeSchema(String schema) {
        if (!StringUtils.hasText(schema)) {
            return null;
        }
        String normalized = schema
                .trim()
                .toLowerCase()
                .replace('-', '_')
                .replace('.', '_')
                .replaceAll("[^a-z0-9_]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", "");
        if (!StringUtils.hasText(normalized)) {
            return null;
        }
        if (Character.isDigit(normalized.charAt(0))) {
            normalized = "t_" + normalized;
        }
        if (normalized.length() > MAX_SCHEMA_LENGTH) {
            normalized = normalized.substring(0, MAX_SCHEMA_LENGTH).replaceAll("_+$", "");
        }
        return StringUtils.hasText(normalized) ? normalized : null;
    }

    private String property(String key, String defaultValue) {
        String value = environment.getProperty(key);
        if (StringUtils.hasText(value)) {
            return value.trim();
        }
        String fromEnv = System.getenv(key);
        if (StringUtils.hasText(fromEnv)) {
            return fromEnv.trim();
        }
        return defaultValue;
    }
}
