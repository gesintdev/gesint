package br.com.gommo.core.tenant;

import java.util.Optional;

public interface AdminClientLookup {

    Optional<TenantContext> findBySlug(String slug);

    Optional<TenantContext> findBySubdomain(String subdomain);

    Optional<TenantContext> findByCustomDomain(String customDomain);
}
