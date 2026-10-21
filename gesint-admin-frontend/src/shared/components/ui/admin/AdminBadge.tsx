"use client";

import { AlertCircle, CheckCircle, PauseCircle, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    Ativo: { bg: "var(--ga-badge-active-bg)", color: "var(--ga-badge-active-fg)" },
    Inativo: { bg: "var(--ga-badge-inactive-bg)", color: "var(--ga-badge-inactive-fg)" },
    Pausado: { bg: "var(--ga-badge-paused-bg)", color: "var(--ga-badge-paused-fg)" },
    Cancelado: { bg: "var(--ga-badge-cancelled-bg)", color: "var(--ga-badge-cancelled-fg)" },
};

export function AdminBadge({ status }: { status: string }) {
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.Inativo;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 7px",
                borderRadius: "var(--ga-radius-sm)",
                fontSize: 11,
                fontWeight: 600,
                background: style.bg,
                color: style.color,
            }}
        >
            {status}
        </span>
    );
}

export function AdminStatusIcon({ status }: { status: string }) {
    if (status === "Ativo") return <CheckCircle size={15} color="var(--ga-badge-active-fg)" />;
    if (status === "Inativo") return <XCircle size={15} color="var(--ga-badge-inactive-fg)" />;
    if (status === "Pausado") return <PauseCircle size={15} color="var(--ga-badge-paused-fg)" />;
    return <AlertCircle size={15} color="var(--ga-badge-cancelled-fg)" />;
}
