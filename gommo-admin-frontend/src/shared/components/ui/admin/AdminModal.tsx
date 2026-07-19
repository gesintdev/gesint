"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

export function AdminModal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                style={{
                    width: "90vw",
                    maxWidth: 720,
                    maxHeight: "90vh",
                    background: "var(--ga-surface)",
                    border: "1px solid var(--ga-border)",
                    borderRadius: "var(--ga-radius)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <div className="flex items-center justify-between border-b border-[var(--ga-border)] px-[18px] py-3.5">
                    <div className="text-sm font-semibold text-[var(--ga-text)]">{title}</div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex cursor-pointer border-0 bg-transparent p-1 text-[var(--ga-text-muted)]"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-[18px]">{children}</div>
            </div>
        </div>
    );
}
