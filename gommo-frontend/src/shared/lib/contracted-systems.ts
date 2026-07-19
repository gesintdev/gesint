import { SystemEnum } from "@/modules/root/enum/SystemEnum";

/** Keys do catalogo Admin → SystemEnum do rail Client. */
const PRODUCT_KEY_TO_SYSTEM: Record<string, SystemEnum> = {
    DP: SystemEnum.DP,
    RH: SystemEnum.RH,
    CTB: SystemEnum.CONTABILIDADE,
    CONTABILIDADE: SystemEnum.CONTABILIDADE,
};

/**
 * Sem filtro comercial no rail: host plataforma ou localhost (dev-public).
 * Login do Client é em public.app_user; admin.admin_user só marca platformAdmin
 * (útil em outros fluxos). Em tenant comercial real o filtro de contratos vale.
 */
export function isPlatformAdminWithoutTenant(options?: {
    platformAdmin?: boolean | null;
    tenantSlug?: string | null;
    contractedSystemKeys?: readonly string[] | null;
}): boolean {
    const slug = options?.tenantSlug?.trim() ?? "";
    // Localhost / schema public / host plataforma: não é cliente comercial.
    return !slug || slug === "dev-public";
}

/**
 * Converte keys comerciais em Set de sistemas.
 * - `null` / `undefined`: host plataforma — todos liberados.
 * - `[]`: tenant sem contratos ACTIVE — nenhum produto comercial.
 */
export function resolveContractedSystems(keys: readonly string[] | null | undefined): Set<SystemEnum> | null {
    if (keys == null) {
        return null;
    }
    const allowed = new Set<SystemEnum>();
    for (const key of keys) {
        const system = PRODUCT_KEY_TO_SYSTEM[key.trim().toUpperCase()];
        if (system) {
            allowed.add(system);
        }
    }
    return allowed;
}

export function isSystemContracted(
    system: SystemEnum | null | undefined,
    contractedSystems: Set<SystemEnum> | null,
): boolean {
    if (system == null) {
        return true;
    }
    if (contractedSystems == null) {
        return true;
    }
    return contractedSystems.has(system);
}
