"use client";

import type { CSSProperties, ReactNode } from "react";

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";
type BtnSize = "sm" | "xs";

const VARIANT_STYLES: Record<BtnVariant, CSSProperties> = {
    primary: {
        background: "var(--ga-primary)",
        color: "#fff",
        border: "1px solid var(--ga-primary-dark)",
    },
    secondary: {
        background: "var(--ga-surface)",
        color: "var(--ga-text)",
        border: "1px solid var(--ga-border-strong)",
    },
    danger: {
        background: "#dc2626",
        color: "#fff",
        border: "1px solid #b91c1c",
    },
    ghost: {
        background: "transparent",
        color: "var(--ga-text-muted)",
        border: "1px solid transparent",
    },
};

export function AdminBtn({
    children,
    onClick,
    variant = "primary",
    size = "sm",
    disabled = false,
    icon,
    type = "button",
}: {
    children?: ReactNode;
    onClick?: () => void;
    variant?: BtnVariant;
    size?: BtnSize;
    disabled?: boolean;
    icon?: ReactNode;
    type?: "button" | "submit";
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: size === "xs" ? "4px 8px" : "6px 12px",
                borderRadius: "var(--ga-radius-sm)",
                fontSize: size === "xs" ? 11 : 12,
                fontWeight: 500,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                whiteSpace: "nowrap",
                ...VARIANT_STYLES[variant],
            }}
        >
            {icon}
            {children}
        </button>
    );
}
