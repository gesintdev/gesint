import { useSession } from "next-auth/react";

import type { SystemScope } from "@/modules/cfg/settings/lib/access-menu-catalog";
import { systemScopeFromEnum } from "@/modules/cfg/settings/lib/access-menu-catalog";
import type { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { useOptionalAppBootstrap } from "@/shared/components/providers/AppBootstrapProvider";
import { readPermissionsFromAccessToken } from "@/auth/access-token-claims";

export function deriveWritePermission(readPermission?: string): string | undefined {
    if (!readPermission) return undefined;
    return readPermission.endsWith(":read") ? `${readPermission.slice(0, -":read".length)}:write` : undefined;
}

export function deriveDeletePermission(readPermission?: string): string | undefined {
    if (!readPermission) return undefined;
    return readPermission.endsWith(":read") ? `${readPermission.slice(0, -":read".length)}:delete` : undefined;
}

export function hasPermission(granted: readonly string[] | null | undefined, permission?: string): boolean {
    if (!permission) return true;
    if (!granted?.length) return false;
    if (granted.includes("*")) return true;
    return granted.includes(permission);
}

export function useSessionPermissions(): readonly string[] {
    const bootstrap = useOptionalAppBootstrap();
    const { data: session } = useSession();
    if (bootstrap?.bootstrap) {
        return bootstrap.bootstrap.permissions ?? [];
    }
    return session?.user?.permissions ?? readPermissionsFromAccessToken(session?.accessToken) ?? [];
}

export function useSessionSystemPermissions(): Record<string, string[]> | null {
    const bootstrap = useOptionalAppBootstrap();
    return bootstrap?.systemPermissions ?? null;
}

/**
 * Authorities concedidas por perfil do sistema (ou CFG). Sem claim no bootstrap, usa o flat.
 */
export function permissionsForSystemScope(
    flat: readonly string[],
    systemPermissions: Record<string, string[]> | null | undefined,
    scope: SystemScope,
): readonly string[] {
    if (!systemPermissions) {
        return flat;
    }
    return systemPermissions[scope] ?? [];
}

export function permissionsForSystem(
    flat: readonly string[],
    systemPermissions: Record<string, string[]> | null | undefined,
    system: SystemEnum | "CFG",
): readonly string[] {
    const scope: SystemScope = system === "CFG" ? "CFG" : systemScopeFromEnum(system);
    return permissionsForSystemScope(flat, systemPermissions, scope);
}

export function usePermissionsForSystem(system: SystemEnum | "CFG"): readonly string[] {
    const flat = useSessionPermissions();
    const systemPermissions = useSessionSystemPermissions();
    return permissionsForSystem(flat, systemPermissions, system);
}

export function useHasPermission(permission?: string): boolean {
    const permissions = useSessionPermissions();
    return hasPermission(permissions, permission);
}
