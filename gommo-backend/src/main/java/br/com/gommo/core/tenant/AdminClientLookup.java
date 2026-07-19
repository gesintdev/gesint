package br.com.gommo.core.tenant;

import java.util.Optional;
import java.util.UUID;

public interface AdminClientLookup {

    Optional<TenantContext> findBySlug(String slug);

    Optional<TenantContext> findByClientId(UUID clientId);

    Optional<TenantContext> findByMobileLoginCode(String mobileLoginCode);

    Optional<TenantContext> findBySubdomain(String subdomain);

    Optional<TenantContext> findByCustomDomain(String customDomain);
}
