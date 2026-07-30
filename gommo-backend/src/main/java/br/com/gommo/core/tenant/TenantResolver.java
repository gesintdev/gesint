package br.com.gommo.core.tenant;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
            String tenantKey = tenantHeaderValue.trim();
            Optional<TenantContext> byMobileLoginCode = adminClientLookup.findByMobileLoginCode(tenantKey);
            if (byMobileLoginCode.isPresent()) {
                return findAndValidate(byMobileLoginCode);
            }
            Optional<TenantContext> byHeaderKey = resolveBySlugOrSubdomain(tenantKey);
            if (byHeaderKey.isPresent()) {
                return byHeaderKey;
            }
            Optional<TenantContext> developmentTenant = resolveDevelopmentPublicTenantByCompanyCode(tenantKey);
            if (developmentTenant.isPresent()) {
                return developmentTenant;
            }
            return resolveDevelopmentPublicTenantBySlug(tenantKey);
        }

        String host = hostParser.normalizeHost(hostHeader);

        Optional<String> subdomain =
                hostParser.extractSubdomain(host, properties.getBaseDomain(), properties.getProductionBaseDomain());
        if (subdomain.isPresent()) {
            return resolveBySlugOrSubdomain(subdomain.get());
        }

        Optional<TenantContext> byCustomDomain = adminClientLookup.findByCustomDomain(host);
        if (byCustomDomain.isPresent()) {
            return findAndValidate(byCustomDomain);
        }

        if (hostParser.isBareLocalHost(host)) {
            Optional<TenantContext> developmentTenant =
                    resolveDevelopmentPublicTenantBySlug(properties.getDevTenantSlug());
            return developmentTenant.isPresent() ? developmentTenant : Optional.of(TenantContext.platform());
        }

        return Optional.empty();
    }

    /**
     * O frontend envia o label do host em {@code X-Tenant-Slug} (ex.: subdomínio {@code posto-sjb}),
     * que pode diferir do slug comercial do cliente. Tenta slug e subdomínio, inclusive variantes
     * hífen/underscore usadas em schema vs DNS.
     */
    private Optional<TenantContext> resolveBySlugOrSubdomain(String tenantKey) {
        for (String candidate : tenantKeyVariants(tenantKey)) {
            Optional<TenantContext> bySlug = adminClientLookup.findBySlug(candidate);
            if (bySlug.isPresent()) {
                return findAndValidate(bySlug);
            }
            Optional<TenantContext> bySubdomain = adminClientLookup.findBySubdomain(candidate);
            if (bySubdomain.isPresent()) {
                return findAndValidate(bySubdomain);
            }
        }
        return Optional.empty();
    }

    private static List<String> tenantKeyVariants(String tenantKey) {
        String trimmed = tenantKey == null ? "" : tenantKey.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }
        Set<String> variants = new LinkedHashSet<>();
        variants.add(trimmed);
        if (trimmed.indexOf('-') >= 0) {
            variants.add(trimmed.replace('-', '_'));
        }
        if (trimmed.indexOf('_') >= 0) {
            variants.add(trimmed.replace('_', '-'));
        }
        return List.copyOf(variants);
    }

    public Optional<TenantContext> resolveByMobileLoginCode(String mobileLoginCode) {
        if (!properties.isEnabled() || mobileLoginCode == null || mobileLoginCode.isBlank()) {
            return Optional.empty();
        }
        Optional<TenantContext> byMobileLoginCode = adminClientLookup.findByMobileLoginCode(mobileLoginCode);
        if (byMobileLoginCode.isPresent()) {
            return findAndValidate(byMobileLoginCode);
        }
        return resolveDevelopmentPublicTenantByCompanyCode(mobileLoginCode);
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
