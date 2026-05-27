package br.com.gommo.admin.modules.client.dto;

import br.com.gommo.admin.core.entity.StatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponseDto {

    private UUID id;
    private StatusEnum status;
    private String name;
    private String slug;
    private String document;
    private String contactEmail;
    private String contactPhone;
    private String notes;
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
