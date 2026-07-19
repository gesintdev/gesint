package br.com.gommo.admin.modules.client.service;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

@Component
public class TenantDatabaseDefaultsApplier {

    private static final String DEFAULT_SECRET_REF = "DB_PASSWORD";

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
        String schema = entity.getDatabaseSchema();
        boolean schemaMissing = !StringUtils.hasText(schema) || "public".equalsIgnoreCase(schema);
        boolean schemaUnsafe = StringUtils.hasText(schema) && !TenantSchemaProvisioner.isSafeSchemaName(schema);
        if (schemaMissing || schemaUnsafe) {
            entity.setDatabaseSchema(TenantSchemaProvisioner.defaultSchemaForSlug(slug));
        }

        if (!StringUtils.hasText(entity.getDatabaseHost())) {
            entity.setDatabaseHost(property("DB_HOST", "localhost"));
        }
        if (entity.getDatabasePort() == null) {
            entity.setDatabasePort(Integer.parseInt(property("DB_PORT", "5432")));
        }
        if (!StringUtils.hasText(entity.getDatabaseName())) {
            entity.setDatabaseName(property("DB_NAME", property("POSTGRES_DB", "gommo")));
        }
        if (!StringUtils.hasText(entity.getDatabaseUser())) {
            entity.setDatabaseUser(property("DB_USER", property("POSTGRES_USER", "gommo")));
        }
        if (!StringUtils.hasText(entity.getDatabaseSecretRef())) {
            entity.setDatabaseSecretRef(DEFAULT_SECRET_REF);
        }
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
