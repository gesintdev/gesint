package br.com.gommo.modules.root.security;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.entity.AppUser;

/**
 * Utilitário para o usuário de sistema ADMIN (role is_system + nome ADMIN).
 * Esse usuário não deve aparecer em listagens/pickers comuns; manipulação via API é bloqueada.
 */
public final class SystemAdminUsers {

    public static final String ADMIN_ROLE_NAME = "ADMIN";

    private SystemAdminUsers() {}

    public static boolean isSystemAdmin(AppUser user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return false;
        }
        return user.getRoles().stream()
                .filter(role -> role.getStatus() == StatusEnum.ACTIVE)
                .anyMatch(role -> role.isSystemRole() && ADMIN_ROLE_NAME.equalsIgnoreCase(role.getName()));
    }

    public static Optional<UUID> currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UUID userId)) {
            return Optional.empty();
        }
        return Optional.of(userId);
    }
}
