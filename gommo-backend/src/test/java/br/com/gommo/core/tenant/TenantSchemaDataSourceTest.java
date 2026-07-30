package br.com.gommo.core.tenant;

import static org.assertj.core.api.Assertions.assertThat;
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
    void applySearchPathUsesTenantSchemaOnlyFailClosed() throws Exception {
        when(connection.createStatement()).thenReturn(statement);
        TenantContextHolder.set(new TenantContext(
                UUID.randomUUID(),
                "empresa-a",
                "tenant_empresa_a",
                "Empresa A",
                TenantProvisioningStatus.READY,
                "ACTIVE"));

        TenantSchemaDataSource.applySearchPath(connection);

        verify(statement).execute("SET search_path TO \"tenant_empresa_a\", gommo_types");
    }

    @Test
    void applySearchPathUsesPublicOnlyForPlatformAccess() throws Exception {
        when(connection.createStatement()).thenReturn(statement);
        TenantContextHolder.set(TenantContext.platform());

        TenantSchemaDataSource.applySearchPath(connection);

        verify(statement).execute("SET search_path TO public, gommo_types");
    }

    @Test
    void applySearchPathUsesPublicAndTypesForDevelopmentPublicTenant() throws Exception {
        when(connection.createStatement()).thenReturn(statement);
        TenantContextHolder.set(TenantContext.developmentPublic("dev-public"));

        TenantSchemaDataSource.applySearchPath(connection);

        verify(statement).execute("SET search_path TO public, gommo_types");
    }

    @Test
    void applySearchPathUsesPublicAndTypesWhenNoTenantContext() throws Exception {
        when(connection.createStatement()).thenReturn(statement);

        TenantSchemaDataSource.applySearchPath(connection);

        verify(statement).execute("SET search_path TO public, gommo_types");
    }

    @Test
    void usesDedicatedTenantSchemaIgnoresPublicSchemaName() {
        TenantContext publicNamed = new TenantContext(
                UUID.randomUUID(),
                "weird",
                "public",
                "Weird",
                TenantProvisioningStatus.READY,
                "ACTIVE");

        assertThat(TenantSchemaDataSource.usesDedicatedTenantSchema(publicNamed)).isFalse();
    }
}
