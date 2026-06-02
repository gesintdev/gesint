import { useSession } from "next-auth/react";

export function deriveWritePermission(readPermission?: string): string | undefined {
    if (!readPermission) return undefined;
    return readPermission.endsWith(":read")
        ? `${readPermission.slice(0, -":read".length)}:write`
        : undefined;
}

export function deriveDeletePermission(readPermission?: string): string | undefined {
    if (!readPermission) return undefined;
    return readPermission.endsWith(":read")
        ? `${readPermission.slice(0, -":read".length)}:delete`
        : undefined;
}

/**
 * Point permission check only.
 * If `permission` is omitted, it returns true.
 * Use route-access helpers for route/menu guards.
 */
export function hasPermission(
    granted: readonly string[] | null | undefined,
    permission?: string,
): boolean {
    if (!permission) return true;
    if (!granted?.length) return false;
    return granted.includes(permission);
}

export function useSessionPermissions(): readonly string[] {
    const { data: session } = useSession();
    return session?.user?.permissions ?? [];
}

export function useHasPermission(permission?: string): boolean {
    const permissions = useSessionPermissions();
    return hasPermission(permissions, permission);
}
