package br.com.gommo.core.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;

import br.com.gommo.modules.cfg.access.entity.SystemScopeEnum;

/**
 * Wildcards de authority:
 * <ul>
 *   <li>{@code *} — GLOBAL_ADMIN (todos os sistemas)
 *   <li>{@code ADM:DP} / {@code ADM:RH} / … — perfil {@code role_type = ADMIN} daquele sistema
 * </ul>
 * Marcadores compactos no JWT; a expansão concreta ocorre no filtro de autenticação.
 */
public final class AuthorityWildcards {

    public static final String UNRESTRICTED = "*";
    public static final String SYSTEM_ADMIN_PREFIX = "ADM:";

    private AuthorityWildcards() {}

    public static boolean isUnrestricted(String authority) {
        return UNRESTRICTED.equals(authority);
    }

    public static boolean isSystemAdminMarker(String authority) {
        return authority != null && authority.startsWith(SYSTEM_ADMIN_PREFIX) && authority.length() > SYSTEM_ADMIN_PREFIX.length();
    }

    public static String systemAdminMarker(SystemScopeEnum system) {
        if (system == null) {
            throw new IllegalArgumentException("system is required for ADM marker");
        }
        return SYSTEM_ADMIN_PREFIX + system.name();
    }

    public static SystemScopeEnum systemFromMarker(String authority) {
        if (!isSystemAdminMarker(authority)) {
            return null;
        }
        try {
            return SystemScopeEnum.valueOf(authority.substring(SYSTEM_ADMIN_PREFIX.length()));
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    public static boolean grantsAll(Collection<? extends GrantedAuthority> authorities) {
        if (authorities == null || authorities.isEmpty()) {
            return false;
        }
        for (GrantedAuthority authority : authorities) {
            if (authority != null && isUnrestricted(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    public static boolean grantsAllStrings(Collection<String> authorities) {
        return authorities != null && authorities.contains(UNRESTRICTED);
    }

    public static boolean allows(Collection<? extends GrantedAuthority> authorities, String required) {
        if (required == null || required.isBlank()) {
            return true;
        }
        if (grantsAll(authorities)) {
            return true;
        }
        if (authorities == null) {
            return false;
        }
        for (GrantedAuthority authority : authorities) {
            if (authority == null) {
                continue;
            }
            String value = authority.getAuthority();
            if (required.equals(value)) {
                return true;
            }
        }
        return false;
    }
}
