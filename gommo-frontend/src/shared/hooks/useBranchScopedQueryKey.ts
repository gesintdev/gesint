"use client";

import { type QueryKey } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";

import { readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";

function serializeQueryKey(queryKey: QueryKey): string {
    return JSON.stringify(queryKey);
}

/** Anexa a filial ativa a qualquer queryKey — dados de listagem dependem do header X-Branch-Id. */
export function useBranchScopedQueryKey(queryKey: QueryKey): QueryKey {
    const activeBranchId = useSyncExternalStore(subscribeActiveBranch, readActiveBranch, () => null);
    const queryKeySignature = serializeQueryKey(queryKey);

    return useMemo(() => {
        const base = JSON.parse(queryKeySignature) as QueryKey;
        const baseArray = Array.isArray(base) ? base : [base];
        return [...baseArray, "branch", activeBranchId ?? "none"];
    }, [activeBranchId, queryKeySignature]);
}
