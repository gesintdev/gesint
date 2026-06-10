package br.com.gommo.admin.modules.client.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.admin.modules.client.entity.TenantDatabaseStrategyEnum;
import br.com.gommo.admin.modules.client.entity.TenantProvisioningStatusEnum;
import br.com.gommo.admin.modules.client.entity.TenantRoutingModeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequestDto {

    @NotBlank @Size(max = 255) private String name;

    @NotBlank @Size(max = 100) private String slug;

    @Size(max = 18) private String document;

    @Size(max = 200) private String contactEmail;

    @Size(max = 20) private String contactPhone;

    private String notes;

    private TenantRoutingModeEnum routingMode;

    @Size(max = 100) private String subdomain;

    @Size(max = 200) private String customDomain;

    private TenantDatabaseStrategyEnum databaseStrategy;

    @Size(max = 200) private String databaseHost;

    private Integer databasePort;

    @Size(max = 100) private String databaseName;

    @Size(max = 100) private String databaseSchema;

    @Size(max = 150) private String databaseUser;

    @Size(max = 255) private String databaseSecretRef;

    private TenantProvisioningStatusEnum provisioningStatus;

    private String provisioningNotes;
}
