package br.com.gommo.core.tenant;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.sql.Connection;
import java.sql.Statement;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSchemaDataSourceTest {

    @Mock
    private Connection connection;

    @Mock
    private Statement statement;

    @AfterEach
    void tearDown() {
        TenantContextHolder.clear();
    }

    @Test
    void applySearchPathUsesTenantSchema() throws Exception {
        when(connection.createStatement()).thenReturn(statement);
        TenantContextHolder.set(new TenantContext(
                UUID.randomUUID(),
                "empresa-a",
                "tenant_empresa_a",
                "Empresa A",
                TenantProvisioningStatus.READY,
                "ACTIVE"));

        TenantSchemaDataSource.applySearchPath(connection);

        verify(statement).execute("SET search_path TO \"tenant_empresa_a\", public");
    }
}
