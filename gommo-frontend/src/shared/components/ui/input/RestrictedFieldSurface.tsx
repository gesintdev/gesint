"use client";

import {Lock} from "lucide-react";

import {hasPermission, useSessionPermissions} from "@/shared/auth/permissions";

/** True quando o campo sensível deve ser mascarado (sem authority / fail-closed). */
export function isSensitiveFieldRestricted(
    sensitive: boolean | undefined,
    sensitivePermission: string | undefined,
    granted: readonly string[] | null | undefined,
): boolean {
    if (!sensitive) return false;
    if (!sensitivePermission?.trim()) return true;
    return !hasPermission(granted, sensitivePermission);
}

export function useIsSensitiveFieldRestricted(
    sensitive?: boolean,
    sensitivePermission?: string,
): boolean {
    const permissions = useSessionPermissions();
    return isSensitiveFieldRestricted(sensitive, sensitivePermission, permissions);
}

type RestrictedFieldSurfaceProps = {
    id?: string;
};

/** Superfície visual RN-02 · SEG-02: listras + cadeado + Restrito. */
export function RestrictedFieldSurface({id}: RestrictedFieldSurfaceProps) {
    return (
        <div
            id={id}
            className="gommo-field gommo-field--restricted"
            role="status"
            aria-label="Restrito"
        >
            <Lock className="size-3.5 shrink-0 text-warning" strokeWidth={2.25} aria-hidden />
            <span className="gommo-field__restricted-label">Restrito</span>
        </div>
    );
}
