"use client";

import type { ReactNode } from "react";

export function AdminSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="mb-5">
            <div
                className="mb-3 border-b border-[var(--ga-border)] pb-1.5 text-[11px] font-bold tracking-[0.05em] text-[var(--ga-text-muted)] uppercase"
            >
                {title}
            </div>
            {children}
        </div>
    );
}

export function AdminFormGrid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: "12px 16px",
            }}
        >
            {children}
        </div>
    );
}
