package br.com.gesint.modules.cfg.access.security;

import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import br.com.gesint.core.branch.BranchContextHolder;
import br.com.gesint.core.config.CtbSystemAvailability;
import br.com.gesint.core.security.AuthorityWildcards;
import br.com.gesint.core.tenant.MultiTenantProperties;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.core.tenant.TenantContractedSystemsLookup;
import br.com.gesint.modules.cfg.access.entity.SystemScopeEnum;

/**
 * Escopo de acesso usado no cadastro de perfis:
 * - sistema precisa estar contratado pelo cliente;
 * - o usuario logado so pode conceder permissoes que ele proprio possui.
 */
@Component
public class AccessScopePolicy {

    private static final Map<SystemScopeEnum, String> PRODUCT_KEY_BY_SYSTEM = new EnumMap<>(SystemScopeEnum.class);

    static {
        PRODUCT_KEY_BY_SYSTEM.put(SystemScopeEnum.DP, "DP");
        PRODUCT_KEY_BY_SYSTEM.put(SystemScopeEnum.RH, "RH");
        PRODUCT_KEY_BY_SYSTEM.put(SystemScopeEnum.CONTABILIDADE, "CTB");
    }

    private final MultiTenantProperties multiTenantProperties;
    private final TenantContractedSystemsLookup contractedSystemsLookup;
    private final CtbSystemAvailability ctbSystemAvailability;

    public AccessScopePolicy(
            MultiTenantProperties multiTenantProperties,
            TenantContractedSystemsLookup contractedSystemsLookup,
            CtbSystemAvailability ctbSystemAvailability) {
        this.multiTenantProperties = multiTenantProperties;
        this.contractedSystemsLookup = contractedSystemsLookup;
        this.ctbSystemAvailability = ctbSystemAvailability;
    }

    /** CFG nao e produto comercial; DP/RH/CTB dependem de contrato ACTIVE do cliente. */
    public boolean isSystemContracted(SystemScopeEnum system) {
        if (system == null || system == SystemScopeEnum.CFG) {
            return true;
        }
        if (!ctbSystemAvailability.isSystemScopeAvailable(system)) {
            return false;
        }
        if (!multiTenantProperties.isEnabled()) {
            return true;
        }
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        // Host da plataforma / localhost (schema public): sem filtro comercial.
        if (tenant == null || tenant.isPlatformAccess() || tenant.isDevelopmentPublic()) {
            return true;
        }
        String productKey = PRODUCT_KEY_BY_SYSTEM.get(system);
        if (productKey == null) {
            return true;
        }
        return contractedKeys(tenant).contains(productKey);
    }

    /** Authorities do usuario logado; um admin global as possui todas, logo nao e filtrado na pratica. */
    public Set<String> currentAuthorities() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Set.of();
        }
        Set<String> authorities = new HashSet<>();
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            authorities.add(authority.getAuthority());
        }
        return authorities;
    }

    public boolean hasAuthority(String authority) {
        if (authority == null) {
            return false;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return AuthorityWildcards.allows(authentication.getAuthorities(), authority);
    }

    /** True quando o usuario e GLOBAL_ADMIN (authority {@code *} no token). */
    public boolean isUnrestricted() {
        return AuthorityWildcards.grantsAllStrings(currentAuthorities());
    }

    /**
     * O contrato pode valer so em algumas filiais, entao o que conta e a filial em que o usuario
     * esta trabalhando. Sem filial ativa sobram as keys validas em qualquer uma.
     */
    private Set<String> contractedKeys(TenantContext tenant) {
        List<String> effective = contractedSystemsLookup
                .findActiveKeyScope(tenant.clientId())
                .keysFor(BranchContextHolder.getOptional().orElse(null));

        Set<String> keys = new HashSet<>();
        for (String key : effective) {
            if (key != null && !key.isBlank()) {
                keys.add(key.trim().toUpperCase(Locale.ROOT));
            }
        }
        if (keys.contains("CONTABILIDADE")) {
            keys.add("CTB");
        }
        return keys;
    }
}
