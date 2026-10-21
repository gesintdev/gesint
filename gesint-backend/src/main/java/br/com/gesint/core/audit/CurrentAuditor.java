package br.com.gesint.core.audit;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Usuario autenticado responsavel pela escrita corrente. Fonte unica para as colunas
 * {@code created_by/updated_by} (Spring Data Auditing) e para {@code revinfo.changed_by} (Envers).
 */
public final class CurrentAuditor {

    private CurrentAuditor() {}

    public static Optional<UUID> userId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UUID userId)) {
            return Optional.empty();
        }
        return Optional.of(userId);
    }
}
