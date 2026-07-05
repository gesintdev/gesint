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
            Optional<TenantContext> developmentTenant = resolveDevelopmentPublicTenantBySlug(tenantHeaderValue);
            if (developmentTenant.isPresent()) {
                return developmentTenant;
            }
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

    public Optional<TenantContext> resolveByMobileLoginCode(String mobileLoginCode) {
        if (!properties.isEnabled() || mobileLoginCode == null || mobileLoginCode.isBlank()) {
            return Optional.empty();
        }
        Optional<TenantContext> developmentTenant = resolveDevelopmentPublicTenantByCompanyCode(mobileLoginCode);
        if (developmentTenant.isPresent()) {
            return developmentTenant;
        }
        return findAndValidate(adminClientLookup.findByMobileLoginCode(mobileLoginCode));
    }

    public TenantContext resolveRequired(String hostHeader, String tenantHeaderValue) {
        return resolve(hostHeader, tenantHeaderValue).orElseThrow(TenantException::notFound);
    }

    private Optional<TenantContext> resolveDevelopmentPublicTenantBySlug(String tenantSlug) {
        if (properties.getDevPublicCompanyCode().isBlank() || properties.getDevTenantSlug().isBlank()) {
            return Optional.empty();
        }
        if (!properties.getDevTenantSlug().equalsIgnoreCase(tenantSlug.trim())) {
            return Optional.empty();
        }
        return Optional.of(TenantContext.developmentPublic(properties.getDevTenantSlug()));
    }

    private Optional<TenantContext> resolveDevelopmentPublicTenantByCompanyCode(String companyCode) {
        String expectedCode = normalizeCompanyCode(properties.getDevPublicCompanyCode());
        if (expectedCode.isBlank() || !expectedCode.equals(normalizeCompanyCode(companyCode))) {
            return Optional.empty();
        }
        return Optional.of(TenantContext.developmentPublic(properties.getDevTenantSlug()));
    }

    private String normalizeCompanyCode(String companyCode) {
        return companyCode == null ? "" : companyCode.replaceAll("\\D", "");
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