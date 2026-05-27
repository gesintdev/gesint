export type SystemAlertVariant = "warning" | "success" | "info" | "error";

export type SystemAlertKind = "confirm" | "alert";

export type SystemAlertRequest = {
    id: string;
    kind: SystemAlertKind;
    variant: SystemAlertVariant;
    title: string;
    message?: string;
    confirmLabel: string;
    cancelLabel: string;
    dismissLabel: string;
    destructive?: boolean;
    resolve: (confirmed: boolean) => void;
};

export type SystemAlertBaseOptions = {
    title: string;
    message?: string;
    variant?: SystemAlertVariant;
};

export type SystemAlertConfirmOptions = SystemAlertBaseOptions & {
    confirmLabel?: string;
    cancelLabel?: string;
    /** Destaca o botão de confirmação como ação destrutiva (ex.: exclusão). */
    destructive?: boolean;
};

export type SystemAlertAlertOptions = SystemAlertBaseOptions & {
    dismissLabel?: string;
};
