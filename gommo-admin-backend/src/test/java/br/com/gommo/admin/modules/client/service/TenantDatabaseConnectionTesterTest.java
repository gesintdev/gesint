package br.com.gommo.admin.modules.client.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.gommo.admin.core.exception.BusinessException;
import br.com.gommo.admin.modules.client.entity.Client;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class TenantDatabaseConnectionTesterTest {

    private final TenantDatabaseConnectionTester tester = new TenantDatabaseConnectionTester();

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(tester, "fallbackPassword", "");
    }

    @Test
    void testConnection_withoutHost_shouldThrowIncompleteConfig() {
        Client client = Client.builder().databaseName("gommo").build();

        assertThatThrownBy(() -> tester.testConnection(client))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Host do banco");
    }

    @Test
    void testConnection_withoutDatabaseName_shouldThrowIncompleteConfig() {
        Client client = Client.builder().databaseHost("localhost").build();

        assertThatThrownBy(() -> tester.testConnection(client))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Nome do banco");
    }

    @Test
    void testConnection_withoutPassword_shouldThrowIncompleteConfig() {
        Client client = Client.builder()
                .databaseHost("localhost")
                .databaseName("gommo")
                .databaseUser("gommo")
                .build();

        assertThatThrownBy(() -> tester.testConnection(client))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Senha não encontrada");
    }
}
