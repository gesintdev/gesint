package br.com.gommo.admin.modules.client.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.List;
import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import br.com.gommo.admin.core.exception.BusinessException;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;

@Component
public class TenantDatabaseConnectionTester {

    private static final List<String> DEFAULT_PASSWORD_KEYS = List.of("DB_PASSWORD", "POSTGRES_PASSWORD");

    private final String fallbackPassword;
    private final Environment environment;

    public TenantDatabaseConnectionTester(
            @Value("${gommo-admin.tenant-db.fallback-password:}") String fallbackPassword, Environment environment) {
        this.fallbackPassword = fallbackPassword;
        this.environment = environment;
    }

    public void testConnection(Client client) {
        if (!StringUtils.hasText(client.getDatabaseHost())) {
            throw ClientException.databaseConfigIncomplete("Host do banco é obrigatório para testar conexão.");
        }
        if (!StringUtils.hasText(client.getDatabaseName())) {
            throw ClientException.databaseConfigIncomplete("Nome do banco é obrigatório para testar conexão.");
        }

        int port = client.getDatabasePort() != null ? client.getDatabasePort() : 5432;
        String password = resolvePassword(client.getDatabaseSecretRef());

        StringBuilder url = new StringBuilder("jdbc:postgresql://")
                .append(client.getDatabaseHost())
                .append(":")
                .append(port)
                .append("/")
                .append(client.getDatabaseName());

        if (client.getDatabaseStrategy() == TenantDatabaseStrategyEnum.DEDICATED_SCHEMA
                && StringUtils.hasText(client.getDatabaseSchema())) {
            url.append("?currentSchema=").append(client.getDatabaseSchema());
        }

        Properties props = new Properties();
        if (StringUtils.hasText(client.getDatabaseUser())) {
            props.setProperty("user", client.getDatabaseUser());
        }
        if (StringUtils.hasText(password)) {
            props.setProperty("password", password);
        }
        props.setProperty("connectTimeout", "5");

        long start = System.currentTimeMillis();
        try (Connection ignored = DriverManager.getConnection(url.toString(), props)) {
            long latency = System.currentTimeMillis() - start;
            if (latency > 30_000) {
                throw ClientException.databaseConnectionFailed("Conexão excedeu o tempo limite.");
            }
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw ClientException.databaseConnectionFailed("Não foi possível conectar: " + ex.getMessage());
        }
    }

    private String resolvePassword(String secretRef) {
        if (StringUtils.hasText(secretRef)) {
            String resolved = lookupProperty(secretRef);
            if (StringUtils.hasText(resolved)) {
                return resolved;
            }
            if (secretRef.startsWith("env:")) {
                resolved = lookupProperty(secretRef.substring(4));
                if (StringUtils.hasText(resolved)) {
                    return resolved;
                }
            }
        }
        if (StringUtils.hasText(fallbackPassword)) {
            return fallbackPassword;
        }
        for (String key : DEFAULT_PASSWORD_KEYS) {
            String resolved = lookupProperty(key);
            if (StringUtils.hasText(resolved)) {
                return resolved;
            }
        }
        throw ClientException.databaseConfigIncomplete(
                "Senha nao encontrada. Defina databaseSecretRef (ex.: DB_PASSWORD), "
                        + "TENANT_DB_FALLBACK_PASSWORD ou gommo-admin.tenant-db.fallback-password.");
    }

    private String lookupProperty(String key) {
        if (!StringUtils.hasText(key)) {
            return null;
        }
        String fromEnv = System.getenv(key);
        if (StringUtils.hasText(fromEnv)) {
            return fromEnv;
        }
        return environment.getProperty(key);
    }
}
