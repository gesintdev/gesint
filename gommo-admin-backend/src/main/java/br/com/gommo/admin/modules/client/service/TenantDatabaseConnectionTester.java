package br.com.gommo.admin.modules.client.service;

import br.com.gommo.admin.core.exception.BusinessException;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.exception.ClientException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class TenantDatabaseConnectionTester {

    @Value("${gommo-admin.tenant-db.fallback-password:}")
    private String fallbackPassword;

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
            throw ClientException.databaseConnectionFailed(
                    "Não foi possível conectar: " + ex.getMessage());
        }
    }

    private String resolvePassword(String secretRef) {
        if (StringUtils.hasText(secretRef)) {
            String fromEnv = System.getenv(secretRef);
            if (StringUtils.hasText(fromEnv)) {
                return fromEnv;
            }
            if (secretRef.startsWith("env:")) {
                String key = secretRef.substring(4);
                fromEnv = System.getenv(key);
                if (StringUtils.hasText(fromEnv)) {
                    return fromEnv;
                }
            }
        }
        if (StringUtils.hasText(fallbackPassword)) {
            return fallbackPassword;
        }
        String dbPassword = System.getenv("DB_PASSWORD");
        if (StringUtils.hasText(dbPassword)) {
            return dbPassword;
        }
        throw ClientException.databaseConfigIncomplete(
                "Senha não encontrada. Defina databaseSecretRef (env) ou gommo-admin.tenant-db.fallback-password.");
    }
}
