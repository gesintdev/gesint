"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useOptionalAppBootstrap } from "@/shared/components/providers/AppBootstrapProvider";
import { readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";
import { isPlatformAdminWithoutTenant } from "@/shared/lib/contracted-systems";
import { useSession } from "next-auth/react";

/**
 * Keys comerciais efetivas do tenant (via AppBootstrap /auth/me).
 * - Host plataforma / localhost (dev-public): null — todos os sistemas.
 * - `branchId` opcional: usa o override daquela filial (coluna Filiais); sem argumento,
 *   usa a filial ativa do header.
 */
export function useContractedSystemKeys(branchId?: string | null): {
    keys: string[] | null;
    ready: boolean;
} {
    const { data: session, status } = useSession();
    const bootstrap = useOptionalAppBootstrap();
    const activeBranchId = useSyncExternalStore(subscribeActiveBranch, readActiveBranch, () => null);
    const effectiveBranchId = branchId !== undefined ? branchId : activeBranchId;

    const overrides = bootstrap?.contractedSystemKeyOverrides ?? null;
    const baseKeys = bootstrap?.contractedSystemKeys ?? null;
    const scopedKeys =
        effectiveBranchId && overrides?.[effectiveBranchId]
            ? overrides[effectiveBranchId]
            : baseKeys;

    const noCommercialFilter = isPlatformAdminWithoutTenant({
        platformAdmin: session?.platformAdmin ?? bootstrap?.bootstrap?.platformAdmin,
        tenantSlug: session?.tenantSlug ?? bootstrap?.bootstrap?.tenantSlug,
        contractedSystemKeys: baseKeys,
    });

    const keys = useMemo(() => {
        if (status === "loading") {
            return null;
        }
        if (status !== "authenticated") {
            return null;
        }
        if (noCommercialFilter) {
            return null;
        }
        if (!bootstrap?.ready) {
            return [];
        }
        return scopedKeys ?? [];
    }, [bootstrap?.ready, noCommercialFilter, scopedKeys, status]);

    const ready =
        status !== "loading" &&
        (status !== "authenticated" || noCommercialFilter || Boolean(bootstrap?.ready));

    return { keys, ready };
}
