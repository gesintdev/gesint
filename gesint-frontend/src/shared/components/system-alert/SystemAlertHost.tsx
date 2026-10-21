"use client";

import clsx from "clsx";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/shared/components/ui/Button";
import { useSystemAlertStore } from "@/shared/system-alert/system-alert.store";
import type { SystemAlertVariant } from "@/shared/system-alert/system-alert.types";

const VARIANT_META: Record<SystemAlertVariant, { icon: typeof Info; bannerClass: string; iconClass: string }> = {
    warning: {
        icon: AlertTriangle,
        bannerClass: "gesint-alert-banner--warning",
        iconClass: "gesint-alert-icon--warning",
    },
    success: {
        icon: CheckCircle2,
        bannerClass: "gesint-alert-banner--success",
        iconClass: "gesint-alert-icon--success",
    },
    info: {
        icon: Info,
        bannerClass: "gesint-alert-banner--info",
        iconClass: "gesint-alert-icon--info",
    },
    error: {
        icon: AlertCircle,
        bannerClass: "gesint-alert-banner--error",
        iconClass: "gesint-alert-icon--error",
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
                <div className="gesint-modal-panel">
                    <div className={clsx("gesint-alert-banner relative", meta.bannerClass)}>
                        <span className={clsx("gesint-alert-icon", meta.iconClass)}>
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
                            className="gesint-btn gesint-btn--ghost gesint-btn--icon-only gesint-btn--sm absolute top-3 right-3"
                            aria-label="Fechar"
                            onClick={() => handleClose(false)}
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    <div className="gesint-modal-footer">
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
