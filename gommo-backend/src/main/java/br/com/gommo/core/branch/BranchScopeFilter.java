package br.com.gommo.core.branch;

import java.io.IOException;
import java.util.UUID;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Publica a filial ativa do request no {@link BranchContextHolder}.
 *
 * Aqui a filial e apenas lida do header; quem valida se o usuario tem acesso a ela e o
 * {@code JwtAuthenticationFilter}, que conhece as permissoes por filial do token.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class BranchScopeFilter extends OncePerRequestFilter {

    public static final String BRANCH_HEADER = "X-Branch-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            UUID branchId = parseBranchId(request.getHeader(BRANCH_HEADER));
            if (branchId != null) {
                BranchContextHolder.set(branchId);
            }
            filterChain.doFilter(request, response);
        } finally {
            BranchContextHolder.clear();
        }
    }

    /** Header invalido nao derruba o request: cai em contexto sem filial e o acesso e negado adiante. */
    private UUID parseBranchId(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(rawValue.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
