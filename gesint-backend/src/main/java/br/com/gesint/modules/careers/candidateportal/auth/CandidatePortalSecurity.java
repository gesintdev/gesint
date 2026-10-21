package br.com.gesint.modules.careers.candidateportal.auth;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import br.com.gesint.modules.careers.candidateportal.exception.CandidatePortalException;

public final class CandidatePortalSecurity {

    public static final String PRINCIPAL_CLAIM = "candidate";
    public static final String AUTHORITY = "ROLE_CANDIDATE";
    public static final String API_PREFIX = "/api/v1/candidate-portal";

    private CandidatePortalSecurity() {}

    public static UUID requireAccountId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID accountId)) {
            throw CandidatePortalException.unauthorized();
        }
        boolean candidate = authentication.getAuthorities().stream()
                .anyMatch(authority -> AUTHORITY.equals(authority.getAuthority()));
        if (!candidate) {
            throw CandidatePortalException.unauthorized();
        }
        return accountId;
    }

    public static boolean isCandidatePortalPath(String requestUri) {
        return requestUri != null && requestUri.startsWith(API_PREFIX);
    }
}
