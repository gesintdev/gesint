package br.com.gesint.core.tenant;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "gesint.multi-tenant")
public class MultiTenantProperties {

    private boolean enabled = false;

    private String devTenantSlug = "";

    private String devPublicCompanyCode = "";

    /**
     * Quando true, permite login de negocio no schema {@code public} (dev-public).
     * Em producao deve permanecer false: public e apenas template DDL.
     */
    private boolean publicLoginEnabled = false;

    private boolean headerEnabled = true;

    private String tenantHeader = "X-Tenant-Slug";

    private String baseDomain = "localhost";

    private String productionBaseDomain = "gesint.com.br";
}