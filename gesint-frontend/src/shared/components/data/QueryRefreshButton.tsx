"use client";

import clsx from "clsx";
import {RefreshCw} from "lucide-react";

import {useQueryRefresh} from "@/shared/components/data/QueryRefreshContext";
import {Button} from "@/shared/components/ui/Button";

/**
 * Botão "Atualizar" da toolbar: refaz a consulta da listagem registrada no `QueryRefreshHostProvider`
 * ancestral (CrudScreen ou tela de workspace). Sem listagem registrada, não aparece.
 */
export function QueryRefreshButton() {
    const queryRefresh = useQueryRefresh();
    if (!queryRefresh) return null;
    return (
        <Button
            aria-label="Atualizar lista"
            title="Atualizar"
            disabled={queryRefresh.isFetching}
            onClick={() => queryRefresh.refetch()}
            leftIcon={
                <RefreshCw
                    className={clsx("size-4", queryRefresh.isFetching && "animate-spin")}
                    strokeWidth={2}
                />
            }
        />
    );
}
