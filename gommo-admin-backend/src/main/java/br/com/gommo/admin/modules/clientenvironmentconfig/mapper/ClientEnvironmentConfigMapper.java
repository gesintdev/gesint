package br.com.gommo.admin.modules.clientenvironmentconfig.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigRequestDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigResponseDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.entity.ClientEnvironmentConfig;

@Component
public class ClientEnvironmentConfigMapper {

    public ClientEnvironmentConfig toEntity(ClientEnvironmentConfigRequestDto dto) {
        return ClientEnvironmentConfig.builder()
                .clientId(dto.getClientId())
                .routingMode(resolveRoutingMode(dto.getRoutingMode()))
                .subdomain(dto.getSubdomain())
                .customDomain(dto.getCustomDomain())
                .databaseStrategy(resolveDatabaseStrategy(dto.getDatabaseStrategy()))
                .databaseHost(dto.getDatabaseHost())
                .databasePort(dto.getDatabasePort())
                .databaseName(dto.getDatabaseName())
                .databaseSchema(dto.getDatabaseSchema())
                .databaseUser(dto.getDatabaseUser())
                .databaseSecretRef(dto.getDatabaseSecretRef())
                .provisioningStatus(resolveProvisioningStatus(dto.getProvisioningStatus()))
                .provisioningNotes(dto.getProvisioningNotes())
                .build();
    }

    public void updateEntity(ClientEnvironmentConfig entity, ClientEnvironmentConfigRequestDto dto) {
        entity.setClientId(dto.getClientId());
        entity.setRoutingMode(resolveRoutingMode(dto.getRoutingMode()));
        entity.setSubdomain(dto.getSubdomain());
        entity.setCustomDomain(dto.getCustomDomain());
        entity.setDatabaseStrategy(resolveDatabaseStrategy(dto.getDatabaseStrategy()));
        entity.setDatabaseHost(dto.getDatabaseHost());
        entity.setDatabasePort(dto.getDatabasePort());
        entity.setDatabaseName(dto.getDatabaseName());
        entity.setDatabaseSchema(dto.getDatabaseSchema());
        entity.setDatabaseUser(dto.getDatabaseUser());
        entity.setDatabaseSecretRef(dto.getDatabaseSecretRef());
        entity.setProvisioningStatus(resolveProvisioningStatus(dto.getProvisioningStatus()));
        entity.setProvisioningNotes(dto.getProvisioningNotes());
    }

    public ClientEnvironmentConfigResponseDto toResponse(ClientEnvironmentConfig entity) {
        return ClientEnvironmentConfigResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .clientId(entity.getClientId())
                .routingMode(entity.getRoutingMode())
                .subdomain(entity.getSubdomain())
                .customDomain(entity.getCustomDomain())
                .databaseStrategy(entity.getDatabaseStrategy())
                .databaseHost(entity.getDatabaseHost())
                .databasePort(entity.getDatabasePort())
                .databaseName(entity.getDatabaseName())
                .databaseSchema(entity.getDatabaseSchema())
                .databaseUser(entity.getDatabaseUser())
                .databaseSecretRef(entity.getDatabaseSecretRef())
                .provisioningStatus(entity.getProvisioningStatus())
                .provisioningNotes(entity.getProvisioningNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private TenantRoutingModeEnum resolveRoutingMode(TenantRoutingModeEnum value) {
        return value == null ? TenantRoutingModeEnum.SUBDOMAIN : value;
    }

    private TenantDatabaseStrategyEnum resolveDatabaseStrategy(TenantDatabaseStrategyEnum value) {
        return value == null ? TenantDatabaseStrategyEnum.DEDICATED_SCHEMA : value;
    }

    private TenantProvisioningStatusEnum resolveProvisioningStatus(TenantProvisioningStatusEnum value) {
        return value == null ? TenantProvisioningStatusEnum.PENDING : value;
    }
}
