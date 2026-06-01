package br.com.gommo.admin.modules.client.mapper;

import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.entity.Client;
import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toEntity(ClientRequestDto dto) {
        return Client.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .document(dto.getDocument())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .notes(dto.getNotes())
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

    public void updateEntity(Client entity, ClientRequestDto dto) {
        entity.setName(dto.getName());
        entity.setSlug(dto.getSlug());
        entity.setDocument(dto.getDocument());
        entity.setContactEmail(dto.getContactEmail());
        entity.setContactPhone(dto.getContactPhone());
        entity.setNotes(dto.getNotes());
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

    public ClientResponseDto toResponse(Client entity) {
        return ClientResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .name(entity.getName())
                .slug(entity.getSlug())
                .document(entity.getDocument())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .notes(entity.getNotes())
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
        return value == null ? TenantDatabaseStrategyEnum.DEDICATED_DATABASE : value;
    }

    private TenantProvisioningStatusEnum resolveProvisioningStatus(TenantProvisioningStatusEnum value) {
        return value == null ? TenantProvisioningStatusEnum.PENDING : value;
    }
}
