package br.com.gommo.core.tenant;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "gommo.multi-tenant")
public class MultiTenantProperties {

    private boolean enabled = false;

    private String devTenantSlug = "";

    private boolean headerEnabled = true;

    private String tenantHeader = "X-Tenant-Slug";

    private String baseDomain = "localhost";

    private String productionBaseDomain = "gommo.com.br";
}
