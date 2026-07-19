package br.com.gommo.admin.modules.client.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import br.com.gommo.admin.core.exception.BusinessException;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

class TenantDatabaseConnectionTesterTest {

    private TenantDatabaseConnectionTester tester;

    @BeforeEach
    void setUp() {
        tester = new TenantDatabaseConnectionTester("", new MockEnvironment());
    }

    @Test
    void testConnection_withoutHost_shouldThrowIncompleteConfig() {
        ClientEnvironmentConfig config =
                ClientEnvironmentConfig.builder().databaseName("gommo").build();

        assertThatThrownBy(() -> tester.testConnection(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Host do banco");
    }

    @Test
    void testConnection_withoutDatabaseName_shouldThrowIncompleteConfig() {
        ClientEnvironmentConfig config =
                ClientEnvironmentConfig.builder().databaseHost("localhost").build();

        assertThatThrownBy(() -> tester.testConnection(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Nome do banco");
    }

    @Test
    void testConnection_withoutPassword_shouldThrowIncompleteConfig() {
        ClientEnvironmentConfig config = ClientEnvironmentConfig.builder()
                .databaseHost("localhost")
                .databaseName("gommo")
                .databaseUser("gommo")
                .build();

        assertThatThrownBy(() -> tester.testConnection(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Senha nao encontrada");
    }
}
