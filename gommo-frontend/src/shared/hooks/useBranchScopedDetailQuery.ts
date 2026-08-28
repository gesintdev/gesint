"use client";

import { type QueryKey, useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";

import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";

type BranchScopedDetailQueryOptions<TData> = Omit<
    UseQueryOptions<TData, Error, TData, QueryKey>,
    "queryKey" | "queryFn"
>;

/** Detalhe de entidade escopada por filial — invalida cache ao trocar o header X-Branch-Id. */
export function useBranchScopedDetailQuery<TData>(
    queryKey: QueryKey,
    queryFn: () => Promise<TData>,
    options?: BranchScopedDetailQueryOptions<TData>,
): UseQueryResult<TData, Error> {
    const scopedQueryKey = useBranchScopedQueryKey(queryKey);
    return useQuery({
        ...options,
        queryKey: scopedQueryKey,
        queryFn,
    });
}
