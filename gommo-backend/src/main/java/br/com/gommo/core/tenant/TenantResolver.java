package br.com.gommo.core.tenant;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class TenantResolver {

    private final MultiTenantProperties properties;
    private final TenantHostParser hostParser;
    private final AdminClientLookup adminClientLookup;

    public TenantResolver(
            MultiTenantProperties properties, TenantHostParser hostParser, AdminClientLookup adminClientLookup) {
        this.properties = properties;
        this.hostParser = hostParser;
        this.adminClientLookup = adminClientLookup;
    }

    public Optional<TenantContext> resolve(String hostHeader, String tenantHeaderValue) {
        if (!properties.isEnabled()) {
            return Optional.empty();
        }

        if (properties.isHeaderEnabled() && tenantHeaderValue != null && !tenantHeaderValue.isBlank()) {
            return findAndValidate(adminClientLookup.findBySlug(tenantHeaderValue.trim()));
        }

        String host = hostParser.normalizeHost(hostHeader);

        Optional<String> subdomain =
                hostParser.extractSubdomain(host, properties.getBaseDomain(), properties.getProductionBaseDomain());
        if (subdomain.isPresent()) {
            Optional<TenantContext> bySubdomain = adminClientLookup.findBySubdomain(subdomain.get());
            if (bySubdomain.isPresent()) {
                return findAndValidate(bySubdomain);
            }
            return findAndValidate(adminClientLookup.findBySlug(subdomain.get()));
        }

        Optional<TenantContext> byCustomDomain = adminClientLookup.findByCustomDomain(host);
        if (byCustomDomain.isPresent()) {
            return findAndValidate(byCustomDomain);
        }

        if (hostParser.isBareLocalHost(host)) {
            return Optional.of(TenantContext.platform());
        }

        return Optional.empty();
    }

    public TenantContext resolveRequired(String hostHeader, String tenantHeaderValue) {
        return resolve(hostHeader, tenantHeaderValue).orElseThrow(TenantException::notFound);
    }

    private Optional<TenantContext> findAndValidate(Optional<TenantContext> candidate) {
        if (candidate.isEmpty()) {
            return Optional.empty();
        }
        validate(candidate.get());
        return candidate;
    }

    public void validate(TenantContext context) {
        TenantProvisioningStatus status = context.provisioningStatus();
        if (status == TenantProvisioningStatus.SUSPENDED) {
            throw TenantException.suspended();
        }
        if (status != TenantProvisioningStatus.READY) {
            throw TenantException.notReady();
        }
        if (context.billingStatus() != null && !context.isBillingActive()) {
            throw TenantException.suspended();
        }
    }
}
