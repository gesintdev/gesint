"use client";

import {useMutation, useQueryClient, type QueryKey} from "@tanstack/react-query";
import {toast} from "sonner";

import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

type StatusService = {
    activate(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
};

type UseCrudStatusActionsOptions = {
    service: StatusService;
    queryKey: QueryKey;
    entityLabel?: string;
};

export function useCrudStatusActions({service, queryKey, entityLabel = "Registro"}: UseCrudStatusActionsOptions) {
    const queryClient = useQueryClient();

    const activateMutation = useMutation({
        mutationFn: (id: string) => service.activate(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey});
            toast.success(`${entityLabel} reativado(a)`);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: `Não foi possível reativar o(a) ${entityLabel.toLowerCase()}.`}),
    });

    const deactivateMutation = useMutation({
        mutationFn: (id: string) => service.deactivate(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey});
            toast.success(`${entityLabel} inativado(a)`);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: `Não foi possível inativar o(a) ${entityLabel.toLowerCase()}.`}),
    });

    const handleActivate = (id: string) => {
        activateMutation.mutate(id);
    };

    const handleDeactivate = async (id: string) => {
        if (!(await SystemAlert.confirmInactivate())) return;
        deactivateMutation.mutate(id);
    };

    return {
        activateMutation,
        deactivateMutation,
        handleActivate,
        handleDeactivate,
    };
}
