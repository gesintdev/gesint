package br.com.gommo.core.branch;

import java.util.Optional;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Filial ativa do request, no mesmo padrao do {@link br.com.gommo.core.tenant.TenantContextHolder}.
 *
 * O tenant define em qual schema a consulta roda; a filial define qual fatia daquele schema o
 * usuario enxerga. Diferente do tenant, que vem do host, a filial vem sempre da escolha explicita
 * do usuario (header {@code X-Branch-Id}).
 */
public final class BranchContextHolder {

    private static final ThreadLocal<BranchContext> CURRENT = new ThreadLocal<>();

    private BranchContextHolder() {}

    public static void set(UUID branchId) {
        CURRENT.set(new BranchContext(branchId, false));
    }

    static void set(BranchContext context) {
        CURRENT.set(context);
    }

    static BranchContext current() {
        return CURRENT.get();
    }

    public static Optional<UUID> getOptional() {
        BranchContext context = CURRENT.get();
        return context == null ? Optional.empty() : Optional.ofNullable(context.branchId());
    }

    public static UUID require() {
        return getOptional().orElseThrow(BranchException::notSelected);
    }

    /** Verdadeiro quando o escopo esta suspenso, ou seja, a leitura enxerga todas as filiais. */
    public static boolean isUnscoped() {
        BranchContext context = CURRENT.get();
        return context == null || context.unscoped() || context.branchId() == null;
    }

    /**
     * Executa uma leitura consolidada, atravessando filiais. Use apenas onde isso e intencional
     * (relatorios consolidados, provisionamento, resolucao de acesso do proprio usuario).
     */
    public static <T> T runUnscoped(Supplier<T> action) {
        BranchContext previous = CURRENT.get();
        CURRENT.set(new BranchContext(previous == null ? null : previous.branchId(), true));
        try {
            return action.get();
        } finally {
            if (previous == null) {
                CURRENT.remove();
            } else {
                CURRENT.set(previous);
            }
        }
    }

    public static void clear() {
        CURRENT.remove();
    }

    record BranchContext(UUID branchId, boolean unscoped) {}
}
