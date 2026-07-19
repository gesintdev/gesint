package br.com.gommo.admin.modules.clientenvironmentconfig.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientEnvironmentConfigResponseDto {

    private UUID id;
    private Integer code;
    private StatusEnum status;
    private UUID clientId;
    private TenantRoutingModeEnum routingMode;
    private String subdomain;
    private String customDomain;
    private TenantDatabaseStrategyEnum databaseStrategy;
    private String databaseHost;
    private Integer databasePort;
    private String databaseName;
    private String databaseSchema;
    private String databaseUser;
    private String databaseSecretRef;
    private TenantProvisioningStatusEnum provisioningStatus;
    private String provisioningNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
