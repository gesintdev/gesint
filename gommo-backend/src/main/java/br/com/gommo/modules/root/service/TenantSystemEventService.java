package br.com.gommo.modules.root.service;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import br.com.gommo.core.tenant.AdminClientLookup;
import br.com.gommo.core.tenant.TenantContext;
import br.com.gommo.core.tenant.TenantContextHolder;
import br.com.gommo.core.tenant.TenantContractedSystemsLookup;
import br.com.gommo.core.tenant.TenantSchemaNames;
import br.com.gommo.modules.root.dto.TenantSystemEventRequestDto;

@Service
public class TenantSystemEventService {

    private static final Logger log = LoggerFactory.getLogger(TenantSystemEventService.class);

    private final AdminClientLookup adminClientLookup;
    private final TenantContractedSystemsLookup contractedSystemsLookup;
    private final JdbcTemplate jdbcTemplate;

    public TenantSystemEventService(
            AdminClientLookup adminClientLookup,
            TenantContractedSystemsLookup contractedSystemsLookup,
            JdbcTemplate jdbcTemplate) {
        this.adminClientLookup = adminClientLookup;
        this.contractedSystemsLookup = contractedSystemsLookup;
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * @return true se o evento foi aplicado (tenant resolvido); false se o tenant não foi encontrado
     */
    @Transactional
    public boolean handleContractedSystemChanged(TenantSystemEventRequestDto event) {
        if (event == null) {
            log.warn("Ignoring tenant system event without body");
            return false;
        }

        TenantContext tenant = resolveTenant(event);
        if (tenant == null || tenant.clientId() == null) {
            log.warn(
                    "Tenant not found for event slug={} clientId={} schemaHint={}",
                    event.getSlug(),
                    event.getClientId(),
                    event.getDatabaseSchema());
            return false;
        }

        String schema = resolveSchema(event, tenant);
        TenantContext bound = new TenantContext(
                tenant.clientId(),
                tenant.slug(),
                schema,
                tenant.name(),
                tenant.provisioningStatus(),
                tenant.billingStatus());

        TenantContextHolder.set(bound);
        try {
            List<String> effectiveKeys = contractedSystemsLookup.findActiveKeysByClientId(bound.clientId());
            String productKey = event.getProductKey() == null ? "" : event.getProductKey().trim().toUpperCase();
            boolean forceLogout = "FORCE_LOGOUT".equalsIgnoreCase(event.getSessionPolicy());

            if (forceLogout) {
                revokeTenantRefreshTokens(schema);
                log.info(
                        "FORCE_LOGOUT applied for tenant={} productKey={} schema={} effectiveKeys={}",
                        bound.slug(),
                        productKey,
                        schema,
                        effectiveKeys);
                return true;
            }

            log.info(
                    "Tenant system event applied slug={} productKey={} effectiveKeys={} policy={}",
                    bound.slug(),
                    productKey,
                    effectiveKeys,
                    event.getSessionPolicy());
            return true;
        } finally {
            TenantContextHolder.clear();
        }
    }

    private TenantContext resolveTenant(TenantSystemEventRequestDto event) {
        if (StringUtils.hasText(event.getSlug())) {
            TenantContext bySlug = adminClientLookup.findBySlug(event.getSlug().trim()).orElse(null);
            if (bySlug != null) {
                return bySlug;
            }
        }
        UUID clientId = parseUuid(event.getClientId());
        if (clientId != null) {
            return adminClientLookup.findByClientId(clientId).orElse(null);
        }
        return null;
    }

    private String resolveSchema(TenantSystemEventRequestDto event, TenantContext tenant) {
        if (StringUtils.hasText(event.getDatabaseSchema())) {
            return TenantSchemaNames.requireSafe(event.getDatabaseSchema().trim());
        }
        return TenantSchemaNames.requireSafe(tenant.schema());
    }

    private UUID parseUuid(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private void revokeTenantRefreshTokens(String schema) {
        String safeSchema = TenantSchemaNames.requireSafe(schema);
        int updated = jdbcTemplate.update(
                """
                UPDATE "%s".refresh_token
                SET revoked = true
                WHERE revoked = false
                """
                        .formatted(safeSchema));
        log.info("Revoked {} refresh tokens in schema {}", updated, safeSchema);
    }
}
