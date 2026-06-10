import { useSystemAlertStore } from "@/shared/system-alert/system-alert.store";
import type {
    SystemAlertAlertOptions,
    SystemAlertConfirmOptions,
    SystemAlertVariant,
} from "@/shared/system-alert/system-alert.types";
const DEFAULT_LABELS = {
    confirm: "Confirmar",
    cancel: "Cancelar",
    dismiss: "OK",
} as const;

function enqueue(
    kind: "confirm" | "alert",
    options: SystemAlertConfirmOptions | SystemAlertAlertOptions,
    defaults: {
        variant: SystemAlertVariant;
        confirmLabel: string;
        cancelLabel: string;
        dismissLabel: string;
        destructive?: boolean;
    },
): Promise<boolean> {
    return new Promise((resolve) => {
        const confirmOpts = kind === "confirm" ? (options as SystemAlertConfirmOptions) : null;
        useSystemAlertStore.getState().enqueue({
            kind,
            variant: options.variant ?? defaults.variant,
            title: options.title,
            message: options.message,
            confirmLabel: confirmOpts?.confirmLabel ?? defaults.confirmLabel,
            cancelLabel: confirmOpts?.cancelLabel ?? defaults.cancelLabel,
            dismissLabel:
                kind === "alert"
                    ? ((options as SystemAlertAlertOptions).dismissLabel ?? defaults.dismissLabel)
                    : defaults.dismissLabel,
            destructive: confirmOpts?.destructive ?? defaults.destructive,
            resolve,
        });
    });
}

export const SystemAlert = {
    /** Dois botões — retorna `true` se confirmou. */
    confirm(options: SystemAlertConfirmOptions): Promise<boolean> {
        return enqueue("confirm", options, {
            variant: "warning",
            confirmLabel: DEFAULT_LABELS.confirm,
            cancelLabel: DEFAULT_LABELS.cancel,
            dismissLabel: DEFAULT_LABELS.dismiss,
            destructive: options.destructive,
        });
    },
    /** Um botão — apenas informa; resolve ao fechar. */
    alert(options: SystemAlertAlertOptions): Promise<void> {
        return enqueue("alert", options, {
            variant: options.variant ?? "info",
            confirmLabel: DEFAULT_LABELS.confirm,
            cancelLabel: DEFAULT_LABELS.cancel,
            dismissLabel: options.dismissLabel ?? DEFAULT_LABELS.dismiss,
        }).then(() => undefined);
    },
    warning: {
        confirm: (options: SystemAlertConfirmOptions) =>
            SystemAlert.confirm({ ...options, variant: options.variant ?? "warning" }),
        alert: (options: SystemAlertAlertOptions) =>
            SystemAlert.alert({ ...options, variant: options.variant ?? "warning" }),
    },
    success: {
        confirm: (options: SystemAlertConfirmOptions) =>
            SystemAlert.confirm({ ...options, variant: options.variant ?? "success" }),
        alert: (options: SystemAlertAlertOptions) =>
            SystemAlert.alert({ ...options, variant: options.variant ?? "success" }),
    },
    info: {
        confirm: (options: SystemAlertConfirmOptions) =>
            SystemAlert.confirm({ ...options, variant: options.variant ?? "info" }),
        alert: (options: SystemAlertAlertOptions) =>
            SystemAlert.alert({ ...options, variant: options.variant ?? "info" }),
    },
    error: {
        confirm: (options: SystemAlertConfirmOptions) =>
            SystemAlert.confirm({ ...options, variant: options.variant ?? "error" }),
        alert: (options: SystemAlertAlertOptions) =>
            SystemAlert.alert({ ...options, variant: options.variant ?? "error" }),
    },
    /** Atalho para exclusão em grids e formulários. */
    confirmDelete(message = "Esta ação não pode ser desfeita. Deseja excluir este registro?"): Promise<boolean> {
        return SystemAlert.confirm({
            variant: "warning",
            title: "Confirmar exclusão",
            message,
            confirmLabel: "Excluir",
            cancelLabel: "Cancelar",
            destructive: true,
        });
    },
};
