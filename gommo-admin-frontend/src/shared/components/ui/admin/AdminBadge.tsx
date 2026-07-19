"use client";

import { AlertCircle, CheckCircle, PauseCircle, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    Ativo: { bg: "#dcfce7", color: "#166534" },
    Inativo: { bg: "#fee2e2", color: "#991b1b" },
    Pausado: { bg: "#fef3c7", color: "#92400e" },
    Cancelado: { bg: "#f1f5f9", color: "#475569" },
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
    if (status === "Ativo") return <CheckCircle size={15} color="#16a34a" />;
    if (status === "Inativo") return <XCircle size={15} color="#dc2626" />;
    if (status === "Pausado") return <PauseCircle size={15} color="#d97706" />;
    return <AlertCircle size={15} color="#64748b" />;
}
