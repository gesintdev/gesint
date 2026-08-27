"use client";

import { type QueryKey } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";

import { readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";

/** Anexa a filial ativa a qualquer queryKey — dados de listagem dependem do header X-Branch-Id. */
export function useBranchScopedQueryKey(queryKey: QueryKey): QueryKey {
    const activeBranchId = useSyncExternalStore(subscribeActiveBranch, readActiveBranch, () => null);
    return useMemo(() => {
        const base = Array.isArray(queryKey) ? queryKey : [queryKey];
        return [...base, "branch", activeBranchId ?? "none"];
    }, [activeBranchId, queryKey]);
}
