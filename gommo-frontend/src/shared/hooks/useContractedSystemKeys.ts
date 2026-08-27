"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { apiFetch } from "@/shared/lib/api.client";
import { readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";
import { isPlatformAdminWithoutTenant } from "@/shared/lib/contracted-systems";

/**
 * Keys comerciais efetivas do tenant.
 * - Host plataforma / localhost (dev-public): null — todos os sistemas.
 * - Com tenant comercial e JWT sem keys: hidrata via GET /auth/tenant.
 */
export function useContractedSystemKeys(): {
    keys: string[] | null;
    ready: boolean;
} {
    const { data: session, status } = useSession();
    const [hydratedKeys, setHydratedKeys] = useState<string[] | null | undefined>(undefined);
    // Lido da fonte externa em vez do ActiveBranchContext: este hook também roda fora do shell.
    const activeBranchId = useSyncExternalStore(subscribeActiveBranch, readActiveBranch, () => null);
    const overrides = session?.contractedSystemKeyOverrides ?? null;
    /** Um contrato restrito a algumas filiais só aparece nas keys da filial em que vale. */
    const scopedKeys =
        activeBranchId && overrides?.[activeBranchId]
            ? overrides[activeBranchId]
            : (session?.contractedSystemKeys ?? null);
    const noCommercialFilter = isPlatformAdminWithoutTenant({
        platformAdmin: session?.platformAdmin,
        tenantSlug: session?.tenantSlug,
        contractedSystemKeys: session?.contractedSystemKeys,
    });

    useEffect(() => {
        if (status !== "authenticated") {
            setHydratedKeys(undefined);
            return;
        }
        if (noCommercialFilter) {
            setHydratedKeys(null);
            return;
        }
        if (!session?.tenantSlug) {
            setHydratedKeys(null);
            return;
        }
        if (scopedKeys != null) {
            setHydratedKeys(scopedKeys);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const data = await apiFetch<{ contractedSystemKeys?: string[] | null }>("/api/v1/auth/tenant");
                if (!cancelled) {
                    setHydratedKeys(data?.contractedSystemKeys ?? []);
                }
            } catch {
                if (!cancelled) {
                    setHydratedKeys([]);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [noCommercialFilter, scopedKeys, session?.tenantSlug, status]);

    const keys = useMemo(() => {
        if (status === "loading") {
            return null;
        }
        // Host plataforma / localhost: sem filtro comercial.
        if (noCommercialFilter) {
            return null;
        }
        if (scopedKeys != null) {
            return scopedKeys;
        }
        if (hydratedKeys !== undefined) {
            return hydratedKeys;
        }
        return [];
    }, [hydratedKeys, noCommercialFilter, scopedKeys, status]);

    const ready =
        status !== "loading" && (noCommercialFilter || scopedKeys != null || hydratedKeys !== undefined);

    return { keys, ready };
}
