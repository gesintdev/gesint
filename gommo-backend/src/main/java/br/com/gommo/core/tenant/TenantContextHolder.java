package br.com.gommo.core.tenant;

import java.util.Optional;

public final class TenantContextHolder {

    private static final ThreadLocal<TenantContext> CURRENT = new ThreadLocal<>();

    private TenantContextHolder() {}

    public static void set(TenantContext context) {
        CURRENT.set(context);
    }

    public static Optional<TenantContext> getOptional() {
        return Optional.ofNullable(CURRENT.get());
    }

    public static TenantContext require() {
        return getOptional().orElseThrow(TenantException::notFound);
    }

    public static void clear() {
        CURRENT.remove();
    }
}
