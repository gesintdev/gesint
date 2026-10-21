"use client";

import { Search } from "lucide-react";

export function AdminSearchBar({
    value,
    onChange,
    placeholder = "Pesquisar...",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div className="relative flex-1">
            <Search
                size={13}
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[var(--ga-text-subtle)]"
            />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "7px 10px 7px 28px",
                    border: "1px solid var(--ga-border-strong)",
                    borderRadius: "var(--ga-radius-sm)",
                    background: "var(--ga-surface)",
                    color: "var(--ga-text)",
                    outline: "none",
                    fontSize: 12,
                }}
            />
        </div>
    );
}
