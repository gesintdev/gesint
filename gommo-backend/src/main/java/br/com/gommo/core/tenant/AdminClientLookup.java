package br.com.gommo.core.tenant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AdminClientLookup {

    Optional<TenantContext> findBySlug(String slug);

    Optional<TenantContext> findByClientId(UUID clientId);

    Optional<TenantContext> findByMobileLoginCode(String mobileLoginCode);

    Optional<TenantContext> findBySubdomain(String subdomain);

    Optional<TenantContext> findByCustomDomain(String customDomain);

    Optional<String> findMobileLoginCodeByClientId(UUID clientId);

    /** Tenants com schema provisionado, para rotinas agendadas multi-tenant. */
    List<TenantContext> findAllReadyTenants();
}
