"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useSyncExternalStore } from "react";

import { readActiveBranch, subscribeActiveBranch } from "@/shared/lib/branch";

/**
 * Ao trocar de filial, invalida o cache do React Query para que listagens abertas
 * (e abas restauradas de outra filial) busquem dados com o novo X-Branch-Id.
 */
export function BranchQueryInvalidator() {
    const queryClient = useQueryClient();
    const activeBranchId = useSyncExternalStore(subscribeActiveBranch, readActiveBranch, () => null);
    const previousBranchIdRef = useRef<string | null>(null);

    useEffect(() => {
        const previous = previousBranchIdRef.current;
        if (previous !== null && previous !== activeBranchId) {
            void queryClient.invalidateQueries();
        }
        previousBranchIdRef.current = activeBranchId;
    }, [activeBranchId, queryClient]);

    return null;
}
