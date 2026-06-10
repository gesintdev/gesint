"use client";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/Button";
import { useSystemAlertStore } from "@/shared/system-alert/system-alert.store";
import type { SystemAlertVariant } from "@/shared/system-alert/system-alert.types";
import clsx from "clsx";

const VARIANT_META: Record<SystemAlertVariant, { icon: typeof Info; bannerClass: string; iconClass: string }> = {
    warning: {
        icon: AlertTriangle,
        bannerClass: "gommo-alert-banner--warning",
        iconClass: "gommo-alert-icon--warning",
    },
    success: {
        icon: CheckCircle2,
        bannerClass: "gommo-alert-banner--success",
        iconClass: "gommo-alert-icon--success",
    },
    info: {
        icon: Info,
        bannerClass: "gommo-alert-banner--info",
        iconClass: "gommo-alert-icon--info",
    },
    error: {
        icon: AlertCircle,
        bannerClass: "gommo-alert-banner--error",
        iconClass: "gommo-alert-icon--error",
    },
};

export function SystemAlertHost() {
    const current = useSystemAlertStore((s) => s.current);
    const dismiss = useSystemAlertStore((s) => s.dismiss);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (current) {
            if (!dialog.open) dialog.showModal();
            return;
        }

        if (dialog.open) dialog.close();
    }, [current]);

    const handleClose = (confirmed: boolean) => {
        dismiss(confirmed);
        dialogRef.current?.close();
    };
    const meta = current ? VARIANT_META[current.variant] : null;
    const Icon = meta?.icon ?? Info;
    const isConfirm = current?.kind === "confirm";

    return (
        <dialog
            ref={dialogRef}
            className="system-alert-modal"
            aria-labelledby={current ? "system-alert-title" : undefined}
            aria-describedby={current?.message ? "system-alert-message" : undefined}
            onCancel={(e) => {
                e.preventDefault();
                handleClose(false);
            }}
            onClose={() => {
                if (useSystemAlertStore.getState().current) handleClose(false);
            }}
            onClick={(e) => {
                if (e.target === dialogRef.current) handleClose(false);
            }}
        >
            {current && meta ? (
                <div className="gommo-modal-panel">
                    <div className={clsx("gommo-alert-banner relative", meta.bannerClass)}>
                        <span className={clsx("gommo-alert-icon", meta.iconClass)}>
                            <Icon className="size-5" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1 pe-8">
                            <h3 id="system-alert-title" className="font-semibold text-base-content">
                                {current.title}
                            </h3>
                            {current.message ? (
                                <p id="system-alert-message" className="mt-1 text-sm text-base-content/75">
                                    {current.message}
                                </p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only gommo-btn--sm absolute top-3 right-3"
                            aria-label="Fechar"
                            onClick={() => handleClose(false)}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="gommo-modal-footer">
                        {isConfirm ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={() => handleClose(false)}>
                                    {current.cancelLabel}
                                </Button>
                                <Button
                                    variant={current.destructive ? "danger" : "primary"}
                                    size="sm"
                                    onClick={() => handleClose(true)}
                                >
                                    {current.confirmLabel}
                                </Button>
                            </>
                        ) : (
                            <Button variant="primary" size="sm" onClick={() => handleClose(true)}>
                                {current.dismissLabel}
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}
        </dialog>
    );
}
