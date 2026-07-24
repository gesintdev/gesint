"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { AdminBtn } from "@/shared/components/ui/admin/AdminBtn";
import { useSystemAlertStore } from "@/shared/system-alert/system-alert.store";
import type { SystemAlertVariant } from "@/shared/system-alert/system-alert.types";

const VARIANT_META: Record<
    SystemAlertVariant,
    { icon: typeof Info; bannerBg: string; iconColor: string }
> = {
    warning: {
        icon: AlertTriangle,
        bannerBg: "#fffbeb",
        iconColor: "#d97706",
    },
    success: {
        icon: CheckCircle2,
        bannerBg: "#ecfdf5",
        iconColor: "#059669",
    },
    info: {
        icon: Info,
        bannerBg: "#eff6ff",
        iconColor: "#2563eb",
    },
    error: {
        icon: AlertCircle,
        bannerBg: "#fef2f2",
        iconColor: "#dc2626",
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
            style={{
                border: "none",
                borderRadius: "var(--ga-radius)",
                padding: 0,
                maxWidth: 420,
                width: "calc(100% - 32px)",
                background: "var(--ga-surface)",
                boxShadow: "var(--ga-shadow)",
                color: "var(--ga-text)",
            }}
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
                <div>
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            padding: "16px 16px 12px",
                            background: meta.bannerBg,
                            position: "relative",
                        }}
                    >
                        <span style={{ color: meta.iconColor, flexShrink: 0, marginTop: 2 }}>
                            <Icon size={20} strokeWidth={2} />
                        </span>
                        <div style={{ minWidth: 0, flex: 1, paddingRight: 28 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{current.title}</div>
                            {current.message ? (
                                <div
                                    style={{
                                        marginTop: 6,
                                        fontSize: 13,
                                        color: "var(--ga-text-muted)",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {current.message}
                                </div>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            aria-label="Fechar"
                            onClick={() => handleClose(false)}
                            style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "var(--ga-text-muted)",
                                padding: 4,
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 8,
                            padding: "12px 16px 16px",
                        }}
                    >
                        {isConfirm ? (
                            <>
                                <AdminBtn variant="ghost" onClick={() => handleClose(false)}>
                                    {current.cancelLabel}
                                </AdminBtn>
                                <AdminBtn
                                    variant={current.destructive ? "danger" : "primary"}
                                    onClick={() => handleClose(true)}
                                >
                                    {current.confirmLabel}
                                </AdminBtn>
                            </>
                        ) : (
                            <AdminBtn variant="primary" onClick={() => handleClose(true)}>
                                {current.dismissLabel}
                            </AdminBtn>
                        )}
                    </div>
                </div>
            ) : null}
        </dialog>
    );
}
